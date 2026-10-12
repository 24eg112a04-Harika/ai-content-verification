package com.example.contentverification.service;

import com.example.contentverification.exception.BadRequestException;
import com.example.contentverification.util.UrlSecurityValidator;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class SafeUrlFetchService {

    private final UrlSecurityValidator urlSecurityValidator;

    public record FetchedContent(String url, String title, String textContent) {}

    public FetchedContent fetchArticleContent(String urlString) {
        // Validate URL and apply SSRF defenses
        urlSecurityValidator.validateSafeUrl(urlString);

        try {
            Document doc = Jsoup.connect(urlString.trim())
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) ContentVerificationBot/1.0")
                    .timeout(12000)
                    .maxBodySize(5 * 1024 * 1024) // 5 MB max
                    .followRedirects(true)
                    .get();

            String title = doc.title();
            if (title == null || title.isBlank()) {
                title = "External Article: " + urlString;
            }

            // Remove non-content elements
            doc.select("script, style, noscript, nav, footer, header, svg, iframe, form").remove();

            // Extract main article or body
            String articleText = "";
            var articleElement = doc.select("article, main, [role=main], .post-content, .article-body, #content");
            if (!articleElement.isEmpty()) {
                articleText = articleElement.first().text();
            } else {
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

            return new FetchedContent(urlString, title, cleanText);

        } catch (BadRequestException e) {
            throw e;
        } catch (IOException e) {
            throw new BadRequestException("Failed to retrieve content from URL: " + e.getMessage());
        } catch (Exception e) {
            throw new BadRequestException("Error processing URL: " + e.getMessage());
        }
    }
}
