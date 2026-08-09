$(document).ready(function () {
    restoreSelection();
    restoreReservation();

    $(".select-workshop").on("click", function () {
        const workshopId = $(this).data("workshop-id");
        const workshopTitle = $(this).data("workshop-title");

        selectWorkshop(workshopId, workshopTitle);
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

function selectWorkshop(workshopId, workshopTitle) {

    sessionStorage.setItem( "selectedWorkshopId", workshopId);
    sessionStorage.setItem( "selectedWorkshopTitle", workshopTitle);

    $("#selected-workshop").text(workshopTitle);

    sessionStorage.removeItem("selectedSeat");

    $("#selected-seat").text("None");

    $("#reservation-status").text( "Workshop selected. Please choose a seat.");
}

function selectSeat(seat) {

    const workshopId = sessionStorage.getItem( "selectedWorkshopId");

    if (!workshopId) {
        $("#reservation-status").text( "Please select a workshop before choosing a seat.");
        return;
    }

    sessionStorage.setItem( "selectedSeat", seat);

    $("#selected-seat").text(seat);

    $("#reservation-status").text( "Seat " + seat + " selected.");
}

function confirmReservation() {

    const workshopId = sessionStorage.getItem( "selectedWorkshopId");
    const workshopTitle = sessionStorage.getItem( "selectedWorkshopTitle");

    const selectedSeat = sessionStorage.getItem( "selectedSeat");

    if (!workshopId) {
        $("#reservation-status").text( "Please select a workshop first.");
        return;
    }

    if (!selectedSeat) {
        $("#reservation-status").text( "Please select a seat before confirming.");
        return;
    }

    const reservation = {
        workshopId: workshopId,
        workshopTitle: workshopTitle,
        seat: selectedSeat
    };

    sessionStorage.setItem( "workshopReservation", JSON.stringify(reservation));

    $("#reservation-status").text( "Reservation confirmed successfully.");

    displayReservation(reservation);
}

function restoreSelection() {

    const workshopTitle = sessionStorage.getItem( "selectedWorkshopTitle");

    const selectedSeat = sessionStorage.getItem( "selectedSeat");

    if (workshopTitle) {
        $("#selected-workshop").text( workshopTitle);
    }

    if (selectedSeat) {
        $("#selected-seat").text( selectedSeat);
    }
}

function restoreReservation() {

    const savedReservation = sessionStorage.getItem( "workshopReservation");

    if (!savedReservation) {
        return;
    }

    const reservation = JSON.parse( savedReservation);

    displayReservation(reservation);
}

function displayReservation(reservation) {

    const container = $("#reservation-details");

    container.empty();

    $("<p>")
        .text( "Workshop: " + reservation.workshopTitle)
        .appendTo(container);

    $("<p>")
        .text( "Seat: " + reservation.seat)
        .appendTo(container);
}
