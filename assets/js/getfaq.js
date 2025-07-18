// getfaq.js
$(document).ready(function () {
  // Replace with your Google Apps Script web app URL
  const webAppUrl =
    "https://script.google.com/macros/s/AKfycbwNMI1Q8M99CGQ1MSiI5VJPrdTrwWIHLwdIsfvMfIbRqnQJ6u08gFllvGo80RRijHvm/exec";

  // Function to check if cached data is valid (less than 24 hours old)
  function isCacheValid() {
    const cache = localStorage.getItem("faqCache");
    if (!cache) return false;

    const { timestamp } = JSON.parse(cache);
    const now = new Date().getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return now - timestamp < oneDayInMs;
  }

  // Function to render FAQs
  function renderFAQs(data) {
    $("#faq-list").empty();
    if (data.length <= 1) {
      $("#faq-list").html("<p>No FAQs available.</p>");
      return;
    }

    data.forEach(function (item, index) {
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
  }

  // Check for cached data
  const cachedData = localStorage.getItem("faqCache");
  //   if (cachedData && isCacheValid()) {
  //     // Use cached data
  //     const { data } = JSON.parse(cachedData);
  //     renderFAQs(data);
  //   } else {
  // Fetch new data
  $.ajax({
    url: webAppUrl,
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.status === "success" && response.data) {
        // Cache the data with a timestamp
        localStorage.setItem(
          "faqCache",
          JSON.stringify({
            data: response.data,
            timestamp: new Date().getTime(),
          })
        );
        renderFAQs(response.data);
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
  //   }
});
