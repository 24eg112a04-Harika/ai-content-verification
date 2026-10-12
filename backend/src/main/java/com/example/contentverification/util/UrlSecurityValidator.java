package com.example.contentverification.util;

import com.example.contentverification.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.URI;
import java.net.URL;

@Component
public class UrlSecurityValidator {

    /**
     * Validates that a URL is safe to fetch and protects against SSRF attacks:
     * - Only allows http and https protocols
     * - Disallows private IPs, localhost, loopbacks, and link-local addresses
     * - Disallows cloud metadata IPs (e.g. 169.254.169.254)
     */
    public void validateSafeUrl(String urlString) {
        if (urlString == null || urlString.isBlank()) {
            throw new BadRequestException("URL cannot be empty");
        }

        try {
            URI uri = new URI(urlString.trim());
            String scheme = uri.getScheme();

            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                throw new BadRequestException("Only HTTP and HTTPS protocols are permitted");
            }

            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                throw new BadRequestException("Invalid URL: missing host");
            }

            // Check for obvious localhost / internal hostnames
            String lowerHost = host.toLowerCase();
            if (lowerHost.equals("localhost") || lowerHost.endsWith(".localhost") ||
                lowerHost.equals("127.0.0.1") || lowerHost.equals("::1") ||
                lowerHost.equals("0.0.0.0") || lowerHost.equals("metadata.google.internal") ||
                lowerHost.endsWith(".local") || lowerHost.endsWith(".internal")) {
                throw new BadRequestException("Access to internal hostnames or localhost is prohibited");
            }

            // Resolve DNS and inspect IP addresses for private ranges
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress address : addresses) {
                if (address.isLoopbackAddress() || address.isAnyLocalAddress() ||
                    address.isLinkLocalAddress() || address.isSiteLocalAddress() ||
                    address.isMulticastAddress()) {
                    throw new BadRequestException("Access to private/local network IP addresses is prohibited");
                }

                // Check for AWS/GCP/Azure link-local metadata (169.254.x.x)
                byte[] bytes = address.getAddress();
                if (bytes.length == 4) {
                    int b0 = bytes[0] & 0xFF;
                    int b1 = bytes[1] & 0xFF;
                    if (b0 == 169 && b1 == 254) {
                        throw new BadRequestException("Access to cloud metadata IP is prohibited");
                    }
                    if (b0 == 10 || (b0 == 172 && (b1 >= 16 && b1 <= 31)) || (b0 == 192 && b1 == 168)) {
                        throw new BadRequestException("Access to private RFC1918 addresses is prohibited");
                    }
                }
            }

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Invalid or unreachable URL: " + e.getMessage());
        }
    }
}
