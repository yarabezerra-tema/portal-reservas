const SUPABASE_URL =
    "https://aoyvwjbhwaermlapxvkq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IxQS_KAQbFja1ljfrbNMSg_A9yk8AlQ";


/* ==========================================
   ELEMENTOS DO LOGIN
========================================== */

const loginForm =
    document.getElementById("login-form");

const message =
    document.getElementById("message");


/* ==========================================
   LOGIN
========================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            message.className = "message";

            message.textContent =
                "Entrando...";


            /* ==============================
               VALIDAR E-MAIL INSTITUCIONAL
            =============================== */

            if (
                !email.endsWith(
                    "@aluno.unifametro.edu.br"
                )
            ) {

                message.className =
                    "message error";

                message.textContent =
                    "Utilize seu e-mail institucional.";

                return;

            }


            try {

                const response =
                    await fetch(
                        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    SUPABASE_KEY
                            },

                            body:
                                JSON.stringify({
                                    email: email,
                                    password: password
                                })
                        }
                    );


                const data =
                    await response.json();


                /* ==============================
                   ERRO NO LOGIN
                =============================== */

                if (!response.ok) {

                    message.className =
                        "message error";

                    message.textContent =
                        data.error_description ||
                        "E-mail ou senha incorretos.";

                    return;

                }


                /* ==============================
                   SALVAR SESSÃO
                =============================== */

                localStorage.setItem(
                    "access_token",
                    data.access_token
                );


                localStorage.setItem(
                    "refresh_token",
                    data.refresh_token
                );


                /* ==============================
                   IR PARA DASHBOARD
                =============================== */

                window.location.href =
                    "dashboard.html";

            }


            catch (error) {

                console.error(
                    "Erro no login:",
                    error
                );


                message.className =
                    "message error";

                message.textContent =
                    "Não foi possível conectar ao sistema.";

            }

        }
    );

}
