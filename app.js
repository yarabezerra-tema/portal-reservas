const SUPABASE_URL =
    "https://aoyvwjbhwaermlapxvkq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IxQS_KAQbFja1ljfrbNMSg_A9yk8AlQ";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Entrando...";

    if (!email.endsWith("@aluno.unifametro.edu.br")) {

        message.textContent =
            "Utilize seu e-mail institucional.";

        return;
    }

    try {

        const response = await fetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            message.textContent =
                data.error_description ||
                "E-mail ou senha incorretos.";

            return;
        }

        localStorage.setItem(
            "access_token",
            data.access_token
        );

        localStorage.setItem(
            "refresh_token",
            data.refresh_token
        );

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error(error);

        message.textContent =
            "Não foi possível conectar ao sistema.";

    }

});
