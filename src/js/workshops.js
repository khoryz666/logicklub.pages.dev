$(document).ready(function () {
	"use strict";

	var selectedWorkshop = null;
	var selectedSeat = null;
	var bookedSeats = [];
	var reservation = null;

	var STORAGE_KEY = "logicklubWorkshopReservation";

	function escapeHtml(str) {
		return $("<div>").text(str).html();
	}

	function saveState() {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
				workshop: selectedWorkshop,
				seat: selectedSeat,
				bookedSeats: bookedSeats,
				reservation: reservation
			}));
		} catch (e) {
			console.error("Failed to save reservation state:", e);
		}
	}

	function reservationCard(workshop, seat) {
		return '<div class="reservation-card">' +
			'<p class="reservation-ok">✓ Reservation Confirmed</p>' +
			'<ul class="reservation-list">' +
			"<li><span>Workshop</span><strong>" + escapeHtml(workshop.title) + "</strong></li>" +
			"<li><span>Date</span><strong>" + escapeHtml(workshop.date) + "</strong></li>" +
			"<li><span>Time</span><strong>" + escapeHtml(workshop.time) + "</strong></li>" +
			"<li><span>Venue</span><strong>" + escapeHtml(workshop.venue) + "</strong></li>" +
			"<li><span>Seat</span><strong>" + escapeHtml(seat) + "</strong></li>" +
			"</ul>" +
			"</div>";
	}

	function updateReserveButton() {
		$("#reserve-btn").prop("disabled", !(selectedWorkshop && selectedSeat));
	}

	// Restore the previous state from sessionStorage so a page refresh
	// keeps the selected workshop, seat and confirmed reservation.
	function restoreState() {
		var saved = null;
		try {
			saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
		} catch (e) {
			saved = null;
		}
		if (!saved) return;

		bookedSeats = saved.bookedSeats || [];

		$(".seat-btn").each(function () {
			var seatId = $(this).data("seat");
			if (bookedSeats.indexOf(seatId) !== -1) {
				$(this).addClass("is-booked");
			}
		});

		if (saved.workshop) {
			var $btn = $('.select-workshop[data-workshop-id="' + saved.workshop.id + '"]');
			if ($btn.length) {
				selectedWorkshop = saved.workshop;
				$(".select-workshop").removeClass("is-selected");
				$btn.addClass("is-selected");
				$("#selected-workshop").text(selectedWorkshop.title);
			}
		}

		if (saved.seat && selectedWorkshop) {
			var $seat = $('.seat-btn[data-seat="' + saved.seat + '"]');
			if ($seat.length && !$seat.hasClass("is-booked")) {
				selectedSeat = saved.seat;
				$(".seat-btn").removeClass("is-selected");
				$seat.addClass("is-selected");
				$("#selected-seat").text(selectedSeat);
			}
		}

		if (saved.reservation) {
			reservation = saved.reservation;
			$("#reservation-details").html(reservationCard(reservation.workshop, reservation.seat));
		}

		updateReserveButton();
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

		saveState();

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

		saveState();
	});

	// 3. Confirm the reservation
	$("#reserve-btn").on("click", function () {
		if (!selectedWorkshop || !selectedSeat) return;

		reservation = { workshop: selectedWorkshop, seat: selectedSeat };
		bookedSeats.push(selectedSeat);

		$("#reservation-details").html(reservationCard(selectedWorkshop, selectedSeat));

		$("#reserve-btn").prop("disabled", true);
		$(".seat-btn.is-selected").addClass("is-booked").removeClass("is-selected");
		$("#selected-seat").text("None");
		selectedSeat = null;

		saveState();
	});

	restoreState();
});
