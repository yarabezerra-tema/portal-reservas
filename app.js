const SUPABASE_URL =
    "https://aoyvwjbhwaermlapxvkq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IxQS_KAQbFja1ljfrbNMSg_A9yk8AlQ";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

/* ==========================================
   ELEMENTOS
========================================== */

const loginForm =
    document.getElementById("login-form");

const message =
    document.getElementById("message");

const forgotPassword =
    document.getElementById("forgot-password");

const emailInput =
    document.getElementById("email");


/* ==========================================
   VALIDAR E-MAIL INSTITUCIONAL
========================================== */

function emailInstitucionalValido(email) {

    const emailNormalizado =
        email.toLowerCase().trim();

    return (
        emailNormalizado.endsWith(
            "@aluno.unifametro.edu.br"
        ) ||
        emailNormalizado.endsWith(
            "@unifametro.edu.br"
        )
    );

}


/* ==========================================
   LOGIN
========================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("password")
                    .value;


            message.className =
                "message";


            message.textContent =
                "Entrando...";


            if (
                !emailInstitucionalValido(email)
            ) {

                message.className =
                    "message error";

                message.textContent =
                    "Utilize seu e-mail institucional da UniFAMETRO.";

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


                if (!response.ok) {

                    message.className =
                        "message error";

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


                if (data.user) {

                    localStorage.setItem(
                        "user_id",
                        data.user.id
                    );


                    localStorage.setItem(
                        "user_email",
                        data.user.email
                    );

                }


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


/* ==========================================
   ESQUECI MINHA SENHA
========================================== */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();

            const email =
                emailInput.value.trim().toLowerCase();

            if (!email) {

                message.className = "message error";
                message.textContent =
                    "Digite seu e-mail antes de solicitar a recuperação da senha.";

                emailInput.focus();
                return;

            }

            if (!emailInstitucionalValido(email)) {

                message.className = "message error";
                message.textContent =
                    "Utilize seu e-mail institucional da UniFAMETRO.";

                return;

            }

            forgotPassword.textContent = "Enviando...";
            forgotPassword.style.pointerEvents = "none";

            const { error } =
                await supabaseClient.auth.resetPasswordForEmail(
                    email,
                    {
                        redirectTo:
                            "https://yarabezerra-tema.github.io/portal-reservas/redefinir-senha.html"
                    }
                );

            if (error) {

                console.error(error);

                message.className = "message error";
                message.textContent =
                    "Não foi possível enviar o e-mail de recuperação.";

                forgotPassword.textContent =
                    "Esqueci minha senha";
                forgotPassword.style.pointerEvents = "auto";

                return;

            }

            message.className = "message success";
            message.textContent =
                "E-mail enviado! Verifique sua caixa de entrada.";

            forgotPassword.textContent = "E-mail enviado";

        }
    );

}

    forgotPassword.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            /* ==============================
               VERIFICAR E-MAIL
            =============================== */

            if (!email) {

                message.className =
                    "message error";

                message.textContent =
                    "Digite seu e-mail antes de solicitar a recuperação da senha.";

                emailInput.focus();

                return;

            }


            /* ==============================
               VALIDAR E-MAIL
            =============================== */

            if (
                !emailInstitucionalValido(email)
            ) {

                message.className =
                    "message error";

                message.textContent =
                    "Utilize seu e-mail institucional da UniFAMETRO.";

                return;

            }


            /* ==============================
               ALTERAR TEXTO
            =============================== */

            forgotPassword.textContent =
                "Enviando e-mail...";

            forgotPassword.style.pointerEvents =
                "none";


            message.className =
                "message";

            message.textContent =
                "";


            try {

                /* ==============================
                   SOLICITAR RECUPERAÇÃO
                =============================== */

                const response =
                    await fetch(
                        `${SUPABASE_URL}/auth/v1/recover`,
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
                                    redirect_to:
                                        "https://yarabezerra-tema.github.io/portal-reservas/redefinir-senha.html"
                                })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Resposta recuperação:",
                    data
                );


                /* ==============================
                   ERRO
                =============================== */

                if (!response.ok) {

                    throw new Error(
                        data.msg ||
                        data.error_description ||
                        "Erro ao enviar recuperação."
                    );

                }


                /* ==============================
                   SUCESSO
                =============================== */

                message.className =
                    "message success";

                message.textContent =
                    "E-mail de recuperação enviado! Verifique sua caixa de entrada.";

                forgotPassword.textContent =
                    "E-mail enviado";

            }


            catch (error) {

                console.error(
                    "Erro na recuperação:",
                    error
                );


                message.className =
                    "message error";

                message.textContent =
                    "Não foi possível enviar o e-mail de recuperação. Verifique o e-mail informado e tente novamente.";


                forgotPassword.textContent =
                    "Esqueci minha senha";


                forgotPassword.style.pointerEvents =
                    "auto";

            }

        }
    );

}
