$(document).ready(function () {
    restoreSelection();
    restoreReservation();

    $(".select-workshop").on("click", function () {
        const workshopId = $(this).data("workshop-id");
        const workshopTitle = $(this).data("workshop-title");
        const workshopDate = $(this).data("workshop-date");
        const workshopTime = $(this).data("workshop-time");
        const workshopVenue = $(this).data("workshop-venue");

        selectWorkshop(workshopId, workshopTitle, workshopDate, workshopTime, workshopVenue);
    });

    $(".seat-btn").on("click", function () {
        const seat = $(this).data("seat");

        selectSeat(seat);
    });

    $("#reserve-btn").on("click", function () {
        confirmReservation();
    });
});

/*
sessionStorage on the workshop page to temporarily store the selected workshop and seat.
This allows the user's selection to remain after refreshing the page while keeping the
reservation data limited to the current browser session.”
*/

function selectWorkshop(workshopId, workshopTitle, workshopDate, workshopTime, workshopVenue) {

    sessionStorage.setItem( "selectedWorkshopId", workshopId);
    sessionStorage.setItem( "selectedWorkshopTitle", workshopTitle);
    sessionStorage.setItem( "selectedWorkshopDate", workshopDate || "");
    sessionStorage.setItem( "selectedWorkshopTime", workshopTime || "");
    sessionStorage.setItem( "selectedWorkshopVenue", workshopVenue || "");

    $("#selected-workshop").text(workshopTitle);

    sessionStorage.removeItem("selectedSeat");

    $("#selected-seat").text("None");

    $(".seat-btn").removeClass("selected");

    $("#reserve-btn").prop("disabled", true);

    // Smooth-scroll down to the seat reservation section
    document.getElementById("seat-reservation").scrollIntoView({ behavior: "smooth" });
}

function selectSeat(seat) {

    const workshopId = sessionStorage.getItem( "selectedWorkshopId");

    if (!workshopId) {
        return;
    }

    sessionStorage.setItem( "selectedSeat", seat);

    $("#selected-seat").text(seat);

    $(".seat-btn").removeClass("selected");
    $('.seat-btn[data-seat="' + seat + '"]').addClass("selected");

    $("#reserve-btn").prop("disabled", false);
}

function confirmReservation() {

    const workshopId = sessionStorage.getItem( "selectedWorkshopId");
    const workshopTitle = sessionStorage.getItem( "selectedWorkshopTitle");
    const workshopDate = sessionStorage.getItem( "selectedWorkshopDate");
    const workshopTime = sessionStorage.getItem( "selectedWorkshopTime");
    const workshopVenue = sessionStorage.getItem( "selectedWorkshopVenue");
    const selectedSeat = sessionStorage.getItem( "selectedSeat");

    if (!workshopId || !selectedSeat) {
        return;
    }

    const reservation = {
        workshopId: workshopId,
        workshopTitle: workshopTitle,
        workshopDate: workshopDate || "",
        workshopTime: workshopTime || "",
        workshopVenue: workshopVenue || "",
        seat: selectedSeat,
        reservedAt: new Date().toISOString()
    };

    const history = getReservationHistory();
    history.unshift(reservation);
    sessionStorage.setItem( "workshopReservations", JSON.stringify(history));

    displayReservations(history);

    document.getElementById("reservation-section").scrollIntoView({ behavior: "smooth" });
}

function restoreSelection() {

    const workshopTitle = sessionStorage.getItem( "selectedWorkshopTitle");

    const selectedSeat = sessionStorage.getItem( "selectedSeat");

    if (workshopTitle) {
        $("#selected-workshop").text( workshopTitle);
    }

    if (selectedSeat) {
        $("#selected-seat").text( selectedSeat);
        $('.seat-btn[data-seat="' + selectedSeat + '"]').addClass("selected");
        $("#reserve-btn").prop("disabled", false);
    } else {
        $("#reserve-btn").prop("disabled", true);
    }
}

function restoreReservation() {

    const history = getReservationHistory();

    displayReservations(history);
}

function getReservationHistory() {

    const saved = sessionStorage.getItem( "workshopReservations");

    if (!saved) {
        return [];
    }

    try {
        const parsed = JSON.parse( saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function displayReservations(history) {

    const container = $("#reservation-details");

    container.empty();

    if (history.length === 0) {
        $("<p>", { class: "reservation-empty" })
            .text( "No workshop reservation has been made yet.")
            .appendTo(container);
        return;
    }

    history.forEach(function (reservation, index) {
        container.append(buildReservationItem(reservation, index));
    });
}

function buildReservationItem(reservation, index) {

    const item = $("<div>", { class: "reservation-item" });

    const header = $("<div>", { class: "reservation-item-header" });
    header.append($("<span>", { class: "reservation-index" }).text("#" + (index + 1)));
    header.append($("<h3>", { class: "reservation-title" }).text(reservation.workshopTitle));
    header.append($("<span>", { class: "reservation-seat-badge" }).text("Seat " + reservation.seat));
    item.append(header);

    const meta = $("<div>", { class: "reservation-meta" });
    if (reservation.workshopDate) {
        meta.append($("<span>").html('<span class="r-label">Date</span>' + reservation.workshopDate));
    }
    if (reservation.workshopTime) {
        meta.append($("<span>").html('<span class="r-label">Time</span>' + reservation.workshopTime));
    }
    if (reservation.workshopVenue) {
        meta.append($("<span>").html('<span class="r-label">Location</span>' + reservation.workshopVenue));
    }
    item.append(meta);

    if (reservation.reservedAt) {
        const booked = new Date(reservation.reservedAt);
        $("<p>", { class: "reservation-booked" })
            .text( "Booked: " + booked.toLocaleString())
            .appendTo(item);
    }

    return item;
}
