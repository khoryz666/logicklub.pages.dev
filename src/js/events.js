$(document).ready(function () {
	loadNews();
    loadEvents();
    enableDragScroll($("#events-container"));

    // Remember the horizontal scroll position so a refresh stays put.
    $("#events-container").on("scroll", function () {
        try { sessionStorage.setItem(EVENTS_SCROLL_KEY, String($(this).scrollLeft())); } catch (e) { /* ignore */ }
    });
});

var EVENTS_SCROLL_KEY = "logicklubEventsScroll";

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
            $("#news-container").html( '<p class="col-12">Unable to load AI news at the moment.</p>');
        }
    });
}

function buildCard(data, defaultTag, linkText, wrapperClass, withImage) {
    const col = $("<div>", { class: wrapperClass || "col-12 col-md-6 col-xl-4" });
    const article = $("<article>", { class: "news-card" });
    const showImage = withImage !== false;
    const tag = (data.tag_list && data.tag_list[0]) || defaultTag;
    const title = $("<h3>", { class: "card-title" }).text(data.title);

    if (showImage) {
        article.addClass("news-card--image");

        // ---- Cover media ----
        const image = data.cover_image || data.social_image || null;
        const media = $("<div>", { class: "card-media" });
        if (image) {
            $("<img>", {
                src: image,
                alt: data.title || "Article cover",
                loading: "lazy"
            }).appendTo(media);
        }
        $("<div>", { class: "card-media-overlay" }).appendTo(media);
        $("<span>", { class: "card-tag" }).text(tag).appendTo(media);

        const caption = $("<div>", { class: "card-media-caption" });
        const yearRow = $("<div>", { class: "card-year-row" });
        const year = data.published_at ? new Date(data.published_at).getFullYear() : new Date().getFullYear();
        yearRow.append($("<span>", { class: "card-year" }).text(year));
        yearRow.append($("<span>", { class: "card-year-line" }));
        caption.append(yearRow);
        caption.append(title);
        media.append(caption);
        article.append(media);
    } else {
        article.addClass("news-card--no-image");
    }

    // ---- Body ----
    const body = $("<div>", { class: "card-body" });

    if (!showImage) {
        $("<span>", { class: "card-tag-plain" }).text(tag).appendTo(body);
    }

    const author = data.user || {};
    const authorName = author.name || "LOGICKlub";
    const avatar = author.profile_image_90 || author.profile_image || null;

    const meta = $("<div>", { class: "card-meta" });
    if (avatar) {
        $("<img>", {
            class: "author-avatar",
            src: avatar,
            alt: authorName,
            loading: "lazy"
        }).appendTo(meta);
    } else {
        $("<span>", { class: "author-avatar author-avatar--fallback" })
            .text(authorName.charAt(0).toUpperCase())
            .appendTo(meta);
    }
    $("<span>", { class: "author-name" }).text(authorName).appendTo(meta);
    $("<span>", { class: "meta-sep" }).text("·").appendTo(meta);
    if (data.readable_publish_date) {
        $("<time>", { class: "meta-date" }).text(data.readable_publish_date).appendTo(meta);
    }
    body.append(meta);

    if (!showImage) {
        body.append(title);
    }

    if (data.description) {
        $("<p>", { class: "card-desc" }).text(data.description).appendTo(body);
    }

    $("<a>", {
        class: "card-link",
        href: data.url,
        target: "_blank",
        rel: "noopener noreferrer"
    }).html(linkText + ' <span class="card-link-arrow">→</span>').appendTo(body);

    article.append(body);
    col.append(article);
    return col;
}

function buildMoreCard() {
    const item = $("<div>", { class: "event-card-item" });
    $("<a>", {
        class: "event-more-card",
        href: "https://dev.to/t/events",
        target: "_blank",
        rel: "noopener noreferrer"
    })
        .html('<span class="event-more-icon">→</span><span class="event-more-text">More Events</span>')
        .appendTo(item);
    return item;
}

function displayNews(articles) {
    const container = $("#news-container");

    container.empty();

    if (articles.length === 0) {
        container.append( $("<p>", { class: "col-12" }).text( "No AI news is available at the moment."));
        return;
    }

    articles.forEach(function (articleData) {
        container.append(buildCard(articleData, "AI", "Read More"));
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
            $("#events-container").html( '<p class="col-12">Unable to load events at the moment.</p>');
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
        container.append( $("<p>", { class: "col-12" }).text( "No AI-related events are available at the moment."));
        return;
    }

    events.forEach(function (event) {
        container.append(buildCard(event, "Event", "View Event", "event-card-item", false));
    });

    container.append(buildMoreCard());

    restoreScrollerPosition();
}

function restoreScrollerPosition() {
    try {
        const saved = parseFloat(sessionStorage.getItem(EVENTS_SCROLL_KEY) || "0");
        if (isFinite(saved) && saved > 0) {
            $("#events-container").scrollLeft(saved);
        }
    } catch (e) { /* ignore */ }
}

// Enable mouse drag-to-scroll on the horizontal events scroller.
// Touch devices already scroll natively via overflow-x.
function enableDragScroll(container) {
    if (!container.length) return;

    let isDown = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;

    container.on("mousedown", function (e) {
        if (e.button !== 0) return; // left mouse button only
        isDown = true;
        moved = false;
        startX = e.pageX;
        startY = e.pageY;
        startScrollLeft = container.scrollLeft();
        container.addClass("is-dragging");
    });

    $(document).on("mousemove", function (e) {
        if (!isDown) return;

        const dx = e.pageX - startX;
        const dy = e.pageY - startY;

        if (!moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
            moved = true;
        }

        if (moved) {
            e.preventDefault();
            container.scrollLeft(startScrollLeft - dx);
        }
    });

    $(document).on("mouseup", function () {
        if (isDown && moved) {
            container[0].addEventListener("click", function suppress(e) {
                e.preventDefault();
                e.stopPropagation();
                container[0].removeEventListener("click", suppress, true);
            }, true);
        }
        isDown = false;
        moved = false;
        container.removeClass("is-dragging");
    });
}
