// getfaq.js
$(document).ready(function () {
  // Replace with your Google Apps Script web app URL
  const webAppUrl =
    "https://script.google.com/macros/s/AKfycbwNMI1Q8M99CGQ1MSiI5VJPrdTrwWIHLwdIsfvMfIbRqnQJ6u08gFllvGo80RRijHvm/exec";

  // Fetch FAQ data from Google Apps Script
  $.ajax({
    url: webAppUrl,
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.status === "success" && response.data) {
        // Clear the loading message
        $("#faq-list").empty();

        // Filter out the header row and create FAQ items
        response.data.forEach(function (item, index) {
          if (index === 0) return; // Skip header row
          const faqItem = `
              <div class="faq-item">
                <h3 class="faq-question">FAQ #${item.faq_nbr}</h3>
                <div class="faq-question">Question: ${item.question}</div>
                <div class="faq-answer">Answer: ${item.answer}</div>
                <br>
              </div>
            `;
          $("#faq-list").append(faqItem);
        });

        // If no FAQs (besides header), show a message
        if (response.data.length <= 1) {
          $("#faq-list").html("<p>No FAQs available.</p>");
        }
      } else {
        $("#faq-list").html(
          "<p>Error loading FAQs: " + response.message + "</p>"
        );
      }
    },
    error: function (xhr, status, error) {
      $("#faq-list").html(
        "<p>Failed to load FAQs. Please try again later.</p>"
      );
    },
  });
});
