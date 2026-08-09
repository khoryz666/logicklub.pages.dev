$(document).ready(function () {
	loadNews();
    loadEvents();
});

/*
DEV Community API provides publicly accessible technology-related content
that is relevant to our AI and Innovation Club. It supports filtering by tags such as AI and
returns structured JSON data, which allows us to demonstrate RESTful API integration
using jQuery AJAX and dynamically update our website content
*/

// News API
function loadNews() {
    $.ajax({
        url: "https://dev.to/api/articles",

        method: "GET",

        data: {
            tag: "ai",
            state: "fresh",
            per_page: 6
        },

        dataType: "json",

        success: function (articles) {
            displayNews(articles);
        },

        error: function () {
            $("#news-container").html( "<p>Unable to load AI news at the moment.</p>");
        }
    });
}

function displayNews(articles) {
    const container = $("#news-container");

    container.empty();

    if (articles.length === 0) {
        container.append( $("<p>").text( "No AI news is available at the moment."));
        return;
    }

    articles.forEach(function (articleData) {
        const article = $("<article>");

        $("<h3>")
            .text(articleData.title)
            .appendTo(article);

        if (articleData.user) {
            $("<p>")
                .text("Author: " + articleData.user.name)
                .appendTo(article);
        }

        if (articleData.readable_publish_date) {
            $("<p>")
                .text( "Published: " + articleData.readable_publish_date)
                .appendTo(article);
        }

        if (articleData.description) {
            $("<p>")
                .text(articleData.description)
                .appendTo(article);
        }

        $("<a>", {
            text: "Read More",
            href: articleData.url,
            target: "_blank",
            rel: "noopener noreferrer"
        }).appendTo(article);

        container.append(article);
    });
}

// Events API
function loadEvents() {
    $.ajax({
        url: "https://dev.to/api/articles",
        method: "GET",
        data: { tag: "events", state: "fresh", per_page: 30 },
        dataType: "json",

        success: function (articles) {
            const events = filterAIEvents(articles);
            displayEvents(events.slice(0, 6));
        },

        error: function () {
            $("#events-container").html( "<p>Unable to load events at the moment.</p>");
        }
    });
}

function filterAIEvents(articles) {
    const keywords = [
        "artificial intelligence",
        "machine learning",
        "deep learning",
        "generative ai",
        "prompt engineering",
        "llm",
        "robotics",
        "automation",
        "innovation"
    ];

    return articles.filter(function (article) {
        const title = article.title || "";
        const description = article.description || "";
        const tags = article.tag_list || [];

        const content = ( title + " " + description + " " + tags.join(" ")).toLowerCase();

        const containsKeyword = keywords.some(function (keyword) {
            return content.includes(keyword);
        });

        const containsAI = /\b(ai|ml|llm|genai)\b/i.test(content);

        return containsKeyword || containsAI;
    });
}

function displayEvents(events) {
    const container = $("#events-container");

    container.empty();

    if (events.length === 0) {
        container.append( $("<p>").text( "No AI-related events are available at the moment."));
        return;
    }

    events.forEach(function (event) {
        const article = $("<article>");

        $("<h3>")
            .text(event.title)
            .appendTo(article);

        if (event.user && event.user.name) {
            $("<p>")
                .text("Posted by: " + event.user.name)
                .appendTo(article);
        }

        if (event.readable_publish_date) {
            $("<p>")
                .text( "Published: " + event.readable_publish_date
                )
                .appendTo(article);
        }

        if (event.description) {
            $("<p>")
                .text(event.description)
                .appendTo(article);
        }

        $("<a>", {
            text: "View Event",
            href: event.url,
            target: "_blank",
            rel: "noopener noreferrer"
        }).appendTo(article);

        container.append(article);
    });
}
