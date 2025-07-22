$(document).ready(function () {
  // Replace with your Google Apps Script web app URL
  const webAppUrl =
    "https://script.google.com/macros/s/AKfycbw1a9bWRqnAdf61WpmyXGoMYLE5PpzbAN6o5LeEnxLK_0P8k2kcjAtnVzjrhYylvN07/exec"; // e.g., https://script.google.com/macros/s/.../exec

  // Cache key and expiration time (24 hours in milliseconds)
  const CACHE_KEY = "siteData";
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Function to sanitize HTML content, allowing <br> and safe <a> tags while preventing XSS
  function sanitizeHTML(str) {
    if (!str) return "";

    // Function to validate URLs
    function isSafeUrl(url) {
      try {
        const parsedUrl = new URL(url);
        // Only allow http and https protocols
        return ["http:", "https:"].includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    }

    // Step 1: Replace newlines with <br> tags
    let result = str.replace(/\n/g, "<br>");

    // Step 2: Extract and process <a> tags using regex
    const linkRegex = /<a\s+href="([^"]+)"\s*>([^<]+)<\/a>/gi;
    result = result.replace(linkRegex, (match, href, text) => {
      // Sanitize the text content of the link
      const div = document.createElement("div");
      div.textContent = text;
      const sanitizedText = div.innerHTML;

      // Validate the href and return a safe <a> tag
      if (isSafeUrl(href)) {
        return `<a href="${href}" target="_blank" rel="noopener">${sanitizedText}</a>`;
      }
      // If URL is unsafe, return just the sanitized text
      return sanitizedText;
    });

    // Step 3: Sanitize any remaining text to prevent XSS
    const div = document.createElement("div");
    div.innerHTML = result;
    // Only allow <br> and <a> tags with href, target, rel attributes
    const allowedTags = ["br", "a"];
    const allowedAttrs = ["href", "target", "rel"];
    Array.from(div.getElementsByTagName("*")).forEach((element) => {
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        element.replaceWith(document.createTextNode(element.textContent));
      } else if (element.tagName.toLowerCase() === "a") {
        // Remove any attributes not in allowedAttrs
        Array.from(element.attributes).forEach((attr) => {
          if (!allowedAttrs.includes(attr.name)) {
            element.removeAttribute(attr.name);
          }
        });
      }
    });

    return div.innerHTML;
  }

  // Function to check if cache is valid (within 24 hours)
  function isCacheValid(cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      if (parsed.timestamp && parsed.data && parsed.data.status === "success") {
        const now = new Date().getTime();
        const cacheTime = new Date(parsed.timestamp).getTime();
        return now - cacheTime < CACHE_EXPIRY;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Function to save data to cache with timestamp
  function saveToCache(data) {
    const cacheData = {
      timestamp: new Date().toISOString(),
      data: data,
    };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log("Cache updated with new data");
    } catch (e) {
      console.warn("Failed to save to localStorage:", e);
    }
  }

  // Fetch data from the web app with retry logic
  function fetchData(retryCount = 3, delay = 1000) {
    $.ajax({
      url: webAppUrl,
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.status === "success" && response.data) {
          // Save response to cache
          saveToCache(response);
          renderContent(response);
        } else {
          handleError(response.message || "Invalid API response");
        }
      },
      error: function (xhr, status, error) {
        if (retryCount > 0) {
          console.warn(`Retrying API request (${retryCount} attempts left)...`);
          setTimeout(() => {
            fetchData(retryCount - 1, delay * 2);
          }, delay);
        } else {
          handleError(
            `Failed to load data after multiple attempts: ${status} - ${error}`
          );
        }
      },
    });
  }

  // Function to render content from API response
  function renderContent(response) {
    const data = response.data;

    // Populate Header section
    if (data.INTRO) {
      $("#header .inner h1").text(
        sanitizeHTML(data.INTRO.business_name || "SilverJROM")
      );
      $("#header .inner .loading-container p").html(
        sanitizeHTML(
          data.INTRO.short_description ||
            "Specialty is helping your business via automation\nAutomation for business [inquiries, processes, CSR, etc]"
        )
      );
    } else {
      console.warn("INTRO data missing in API response");
      $("#header .inner h1").text("SilverJROM");
      $("#header .inner .loading-container p").html(
        "Specialty is helping your business via automation<br>Automation for business [inquiries, processes, CSR, etc]"
      );
    }

    // Populate Intro section
    if (data.INTRO) {
      $("#intro .loading-container p")
        .eq(0)
        .html(
          sanitizeHTML(
            data.INTRO.long_description1 || "No introduction available."
          )
        );
      $("#intro .loading-container p")
        .eq(1)
        .html(sanitizeHTML(data.INTRO.long_description2 || ""));
    } else {
      $("#intro .loading-container p")
        .eq(0)
        .html("Error loading introduction. Please try again later.");
      $("#intro .loading-container p").eq(1).html("");
    }

    // Populate FAQ section
    const faqList = $("#faq-list");
    faqList.empty(); // Clear loading message
    if (data.FAQS && Array.isArray(data.FAQS) && data.FAQS.length > 0) {
      data.FAQS.forEach((faq) => {
        if (faq && faq.question && faq.answer) {
          faqList.append(`
            <div class="faq-item">
              <h3>${sanitizeHTML(faq.question)}</h3>
              <p>${sanitizeHTML(faq.answer)}</p>
            </div>
          `);
        } else {
          console.warn("Invalid FAQ entry:", faq);
        }
      });
    } else {
      faqList.append("<p>No FAQs available at this time.</p>");
      console.warn("No valid FAQs in API response");
    }

    // Populate Testimonials section
    const testimonialSection = $("#testimonials");
    testimonialSection.find(".loading-container p").remove(); // Remove loading message
    if (
      data.Testimonials &&
      Array.isArray(data.Testimonials) &&
      data.Testimonials.length > 0
    ) {
      data.Testimonials.forEach((testimonial) => {
        if (testimonial && testimonial.name && testimonial.details) {
          testimonialSection.append(`
            <p><strong>${sanitizeHTML(
              testimonial.name
            )}:</strong> ${sanitizeHTML(testimonial.details)}</p>
          `);
        } else {
          console.warn("Invalid testimonial entry:", testimonial);
        }
      });
    } else {
      testimonialSection.append(
        "<p>No testimonials available at this time.</p>"
      );
      console.warn("No valid testimonials in API response");
    }

    // Populate Products section
    const productsSection = $("#products");
    productsSection.find(".loading-container p").remove(); // Remove loading message
    if (
      data.Products &&
      Array.isArray(data.Products) &&
      data.Products.length > 0
    ) {
      productsSection.append('<h3 class="major">Our Products</h3>');
      data.Products.forEach((product) => {
        if (product && product.header && product.details) {
          productsSection.append(`
            <h4>${sanitizeHTML(product.header)}</h4>
            <p>${sanitizeHTML(product.details)}</p>
          `);
        } else {
          console.warn("Invalid product entry:", product);
        }
      });
    } else {
      productsSection.append("<p>No products available at this time.</p>");
      console.warn("No valid products in API response");
    }
  }

  // Handle errors consistently
  function handleError(message) {
    console.error("Error fetching data:", message);
    $("#header .inner .loading-container p").html(
      "<p>Error loading details: " + sanitizeHTML(message) + "</p>"
    );
    $("#intro .loading-container p")
      .eq(0)
      .html("<p>Error loading introduction: " + sanitizeHTML(message) + "</p>");
    $("#intro .loading-container p").eq(1).html("");
    $("#faq-list").html(
      "<p>Error loading FAQs: " + sanitizeHTML(message) + "</p>"
    );
    $("#testimonials").append(
      "<p>Error loading testimonials: " + sanitizeHTML(message) + "</p>"
    );
    $("#products").append(
      "<p>Error loading products: " + sanitizeHTML(message) + "</p>"
    );
  }

  // Check cache and fetch data if needed
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData && isCacheValid(cachedData)) {
    try {
      const parsed = JSON.parse(cachedData);
      console.log("Using cached data from", parsed.timestamp);
      renderContent(parsed.data);
    } catch (e) {
      console.error("Error parsing cached data:", e);
      fetchData();
    }
  } else {
    console.log("Cache is missing or expired, fetching fresh data");
    fetchData();
  }
});
