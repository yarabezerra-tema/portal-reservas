const SUPABASE_URL =
    "https://aoyvwjbhwaermlapxvkq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IxQS_KAQbFja1ljfrbNMSg_A9yk8AlQ";


/* ==========================================
   SUPABASE
========================================== */

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
               LOGIN
            =============================== */

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


                /* ==============================
                   IR PARA O DASHBOARD
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


/* ==========================================
   ESQUECI MINHA SENHA
========================================== */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            /* ==============================
               VERIFICAR SE DIGITOU E-MAIL
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
               VALIDAR E-MAIL INSTITUCIONAL
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
               ALTERAR BOTÃO
            =============================== */

            forgotPassword.textContent =
                "Enviando...";

            forgotPassword.style.pointerEvents =
                "none";


            message.className =
                "message";

            message.textContent =
                "";


            /* ==============================
               ENVIAR RECUPERAÇÃO
            =============================== */

            try {

                const { error } =
                    await supabaseClient.auth
                        .resetPasswordForEmail(
                            email,
                            {
                                redirectTo:
                                    "https://yarabezerra-tema.github.io/portal-reservas/redefinir-senha.html"
                            }
                        );


                /* ==============================
                   VERIFICAR ERRO
                =============================== */

                if (error) {

                    console.error(
                        "Erro Supabase:",
                        error
                    );

                    throw error;

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
