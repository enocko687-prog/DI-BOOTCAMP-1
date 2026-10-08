const servicesGrid =
    document.getElementById("servicesGrid");

const serviceSelect =
    document.getElementById("serviceSelect");

const bookingForm =
    document.getElementById("bookingForm");

const bookingMessage =
    document.getElementById("bookingMessage");

const dateInput =
    document.getElementById("date");

const requestForm =
    document.getElementById("requestForm");

const requestMessage =
    document.getElementById("requestMessage");

document.getElementById("year")
    .textContent =
    new Date().getFullYear();


// Prevent booking dates in the past

dateInput.min =
    new Date()
        .toISOString()
        .split("T")[0];


// Load services

async function loadServices() {

    try {

        const response =
            await fetch("/api/services");

        const services =
            await response.json();


        servicesGrid.innerHTML =
            services.map(
                (service, index) => {

                    return `

                    <article class="service">

                        <div class="service-number">
                            ${String(index + 1)
                                .padStart(2, "0")}
                        </div>

                        <h3>
                            ${escapeHTML(service.name)}
                        </h3>

                        <p>
                            ${escapeHTML(
                                service.description || ""
                            )}
                        </p>

                        <div class="price">

                            KSh
                            ${Number(service.price)
                                .toLocaleString("en-KE")}

                            •

                            ${service.duration_minutes}
                            minutes

                        </div>

                    </article>

                    `;

                }
            ).join("");


        serviceSelect.innerHTML =
            `<option value="">
                Choose a service
            </option>` +

            services.map(
                service => `

                <option
                    value="${service.id}"
                >

                    ${escapeHTML(service.name)}

                    —
                    KSh
                    ${Number(service.price)
                        .toLocaleString("en-KE")}

                </option>

                `
            ).join("");


    } catch (error) {

        servicesGrid.innerHTML =
            "<p>Unable to load services.</p>";

        serviceSelect.innerHTML =
            "<option>Unable to load services</option>";

    }

}


// Submit booking

bookingForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        bookingMessage.textContent =
            "Saving your booking...";

        bookingMessage.style.color =
            "#d4af37";


        const formData =
            new FormData(bookingForm);

        const data =
            Object.fromEntries(
                formData.entries()
            );


        try {

            const response =
                await fetch(
                    "/api/bookings",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(data)
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Booking failed."
                );

            }


            bookingMessage.textContent =
                `Booking #${result.booking.id}
                 received successfully.
                 The shop will confirm your appointment.`;

            bookingMessage.style.color =
                "#68d391";


            bookingForm.reset();

            dateInput.min =
                new Date()
                    .toISOString()
                    .split("T")[0];


        } catch (error) {

            bookingMessage.textContent =
                error.message;

            bookingMessage.style.color =
                "#ff7b7b";

        }

    }
);

requestForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();
        requestMessage.textContent = "Sending your request...";
        requestMessage.style.color = "#d4af37";

        const data = Object.fromEntries(
            new FormData(requestForm).entries()
        );

        try {
            const response = await fetch("/api/requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to send your request.");
            }

            requestMessage.textContent =
                `Request #${result.request.id} sent. We will contact you shortly.`;
            requestMessage.style.color = "#68d391";
            requestForm.reset();
        } catch (error) {
            requestMessage.textContent = error.message;
            requestMessage.style.color = "#ff7b7b";
        }
    }
);


// Security helper

function escapeHTML(value) {

    return String(value)
        .replace(
            /[&<>"']/g,

            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            })[character]
        );

}


loadServices();