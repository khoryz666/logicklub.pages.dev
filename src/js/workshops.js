$(document).ready(function () {
	"use strict";

	var selectedWorkshop = null;
	var selectedSeat = null;

	function escapeHtml(str) {
		return $("<div>").text(str).html();
	}

	// 1. Choose a workshop
	$(".select-workshop").on("click", function () {
		var $btn = $(this);

		selectedWorkshop = {
			id: $btn.data("workshopId"),
			title: $btn.data("workshopTitle"),
			date: $btn.data("workshopDate"),
			time: $btn.data("workshopTime"),
			venue: $btn.data("workshopVenue")
		};

		$(".select-workshop").removeClass("is-selected");
		$btn.addClass("is-selected");

		$("#selected-workshop").text(selectedWorkshop.title);

		// Reset seat choice whenever the workshop changes
		selectedSeat = null;
		$(".seat-btn").removeClass("is-selected");
		$("#selected-seat").text("None");
		$("#reserve-btn").prop("disabled", true);

		document.getElementById("seat-reservation").scrollIntoView({ behavior: "smooth", block: "start" });
	});

	// 2. Choose a seat
	$(".seat-btn").on("click", function () {
		if (!selectedWorkshop) {
			alert("Please select a workshop first.");
			return;
		}

		var $seat = $(this);

		$(".seat-btn").removeClass("is-selected");
		$seat.addClass("is-selected");

		selectedSeat = $seat.data("seat");
		$("#selected-seat").text(selectedSeat);

		$("#reserve-btn").prop("disabled", false);
	});

	// 3. Confirm the reservation
	$("#reserve-btn").on("click", function () {
		if (!selectedWorkshop || !selectedSeat) return;

		$("#reservation-details").html(
			'<div class="reservation-card">' +
			'<p class="reservation-ok">✓ Reservation Confirmed</p>' +
			'<ul class="reservation-list">' +
			"<li><span>Workshop</span><strong>" + escapeHtml(selectedWorkshop.title) + "</strong></li>" +
			"<li><span>Date</span><strong>" + escapeHtml(selectedWorkshop.date) + "</strong></li>" +
			"<li><span>Time</span><strong>" + escapeHtml(selectedWorkshop.time) + "</strong></li>" +
			"<li><span>Venue</span><strong>" + escapeHtml(selectedWorkshop.venue) + "</strong></li>" +
			"<li><span>Seat</span><strong>" + escapeHtml(selectedSeat) + "</strong></li>" +
			"</ul>" +
			"</div>"
		);

		$("#reserve-btn").prop("disabled", true);
		$(".seat-btn").addClass("is-booked");
		$(".seat-btn.is-selected").removeClass("is-selected");
		$("#selected-seat").text("None");
		selectedSeat = null;
	});
});
