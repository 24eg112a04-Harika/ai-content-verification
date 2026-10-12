package com.example.contentverification.service;

import com.example.contentverification.exception.BadRequestException;
import com.example.contentverification.util.UrlSecurityValidator;
import lombok.RequiredArgsConstructor;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;

@Service
@RequiredArgsConstructor
public class SafeUrlFetchService {

    private static final int MAX_REDIRECT_HOPS = 5;

    private final UrlSecurityValidator urlSecurityValidator;

    public record FetchedContent(String url, String title, String textContent) {}

    public FetchedContent fetchArticleContent(String urlString) {
        String currentUrl = urlString.trim();

        // Validate the initial URL and every redirect target (SSRF defense:
        // a public URL must not be able to bounce the client at a private IP).
        for (int hop = 0; hop <= MAX_REDIRECT_HOPS; hop++) {
            urlSecurityValidator.validateSafeUrl(currentUrl);

            try {
                Connection.Response response = Jsoup.connect(currentUrl)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) ContentVerificationBot/1.0")
                        .timeout(12000)
                        .maxBodySize(5 * 1024 * 1024) // 5 MB max
                        .followRedirects(false)
                        .execute();

                int status = response.statusCode();
                if (status >= 300 && status < 400) {
                    String location = response.headers().get("Location");
                    if (location == null || location.isBlank()) {
                        throw new BadRequestException("Redirect response from URL is missing a Location header");
                    }
                    currentUrl = URI.create(currentUrl).resolve(location).toString();
                    continue;
                }

                Document doc = response.parse();
                return parseDocument(doc, currentUrl, urlString);

            } catch (BadRequestException e) {
                throw e;
            } catch (IOException e) {
                throw new BadRequestException("Failed to retrieve content from URL: " + e.getMessage());
            } catch (Exception e) {
                throw new BadRequestException("Error processing URL: " + e.getMessage());
            }
        }

        throw new BadRequestException("Too many redirects while retrieving the specified URL");
    }

    private FetchedContent parseDocument(Document doc, String finalUrl, String originalUrl) {
        String title = doc.title();
        if (title == null || title.isBlank()) {
            title = "External Article: " + finalUrl;
        }

        // Remove non-content elements
        doc.select("script, style, noscript, nav, footer, header, svg, iframe, form").remove();

        // Extract main article or body
        String articleText = "";
        var articleElement = doc.select("article, main, [role=main], .post-content, .article-body, #content");
        if (!articleElement.isEmpty()) {
            articleText = articleElement.first().text();
        } else if (doc.body() != null) {
            articleText = doc.body().text();
        }

        // Sanitize and normalize
        String cleanText = Jsoup.clean(articleText, Safelist.none()).trim();
        if (cleanText.isBlank()) {
            throw new BadRequestException("No readable text content could be extracted from the specified URL");
        }

        // Cap length to 30,000 characters for processing
        if (cleanText.length() > 30000) {
            cleanText = cleanText.substring(0, 30000);
        }

        return new FetchedContent(originalUrl, title, cleanText);
    }
}
