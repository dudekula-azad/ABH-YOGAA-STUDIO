// ================= HERO ZOOM EFFECT =================

const hero = document.querySelector(".hero");

if (hero) {
    window.addEventListener("scroll", () => {
        let scroll = window.scrollY;
        hero.style.backgroundSize = `${100 + scroll * 0.03}%`;
    });
}


// ================= BOOKING FORM =================

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", function (e) {

        e.preventDefault();

        document.getElementById("summaryName").innerText =
            document.getElementById("name").value;

        document.getElementById("summaryPhone").innerText =
            document.getElementById("phone").value;

        document.getElementById("summaryEmail").innerText =
            document.getElementById("email").value;

        document.getElementById("summaryAge").innerText =
            document.getElementById("age").value;

        document.getElementById("summaryGender").innerText =
            document.getElementById("gender").value;

        document.getElementById("summaryBatch").innerText =
            document.getElementById("batch").value;
        
        document.getElementById("summaryMode").innerText =
            document.getElementById("mode").value;

        document.getElementById("summaryMedical").innerText =
            document.getElementById("medical").value || "None";

        document.getElementById("bookingSummary").style.display = "block";

        document.getElementById("bookingSummary").scrollIntoView({
            behavior: "smooth"
        });

    });

}
// ================= PAYMENT =================
const bookingId =
"ABH" +
new Date().getFullYear() +
Math.floor(1000 + Math.random() * 9000);

document.getElementById("bookingId").innerText =
"#" + bookingId;
const proceedBtn = document.getElementById("proceedPaymentBtn");

if (proceedBtn) {

    proceedBtn.addEventListener("click", function () {

        document.getElementById("paymentSection").style.display = "block";

        document.getElementById("paymentSection").scrollIntoView({
            behavior: "smooth"
        });

    });

}

const payNowBtn = document.getElementById("payNowBtn");

if (payNowBtn) {

    payNowBtn.addEventListener("click", function () {

        document.getElementById("paymentSection").style.display = "none";

        document.getElementById("paymentSuccess").style.display = "block";
        document.getElementById("successMode").innerText =
        document.getElementById("summaryMode").innerText;

        document.getElementById("paymentSuccess").scrollIntoView({
            behavior: "smooth"
        });

    });

}
// ================= SCROLL REVEAL =================

const reveals = document.querySelectorAll(".reveal");

function revealSections(){

    reveals.forEach(section=>{

        const top = section.getBoundingClientRect().top;

        const windowHeight = window.innerHeight;

        if(top < windowHeight - 120){

            section.classList.add("active");

        }

    });

}

window.addEventListener("scroll", revealSections);

revealSections();
// ================= PAYMENT CARD SELECTION =================

const paymentCards = document.querySelectorAll(".payment-card");
const paymentRadios = document.querySelectorAll('input[name="payment"]');

paymentCards.forEach(card => {

    card.addEventListener("click", () => {

        // Remove active class from all cards
        paymentCards.forEach(c => c.classList.remove("active"));

        // Uncheck all radio buttons
        paymentRadios.forEach(r => r.checked = false);

        // Add active class to clicked card
        card.classList.add("active");

        // Check only this card's radio button
        const radio = card.querySelector('input[name="payment"]');
        radio.checked = true;

    });

});