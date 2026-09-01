const SUPABASE_URL =
    "https://walmglpuysduteeiwybh.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VROzleLIlpKkECuqWVqzXw_rUwTMpd6";


/* =====================================================
   ELEMENTOS DA PÁGINA
===================================================== */

const loginForm =
    document.getElementById("login-form");

const message =
    document.getElementById("message");


/* =====================================================
   MOSTRAR MENSAGEM
===================================================== */

function mostrarMensagem(texto, tipo = "error") {

    if (!message) return;

    message.textContent = texto;

    message.className =
        `message ${tipo}`;

}


/* =====================================================
   LOGIN
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("password")
                    .value;


            mostrarMensagem(
                "Entrando...",
                "success"
            );


            /* ==========================================
               VALIDAR E-MAIL INSTITUCIONAL
            ========================================== */

            const emailValido =
                email.endsWith(
                    "@aluno.unifametro.edu.br"
                ) ||
                email.endsWith(
                    "@professor.unifametro.edu.br"
                ) ||
                email.endsWith(
                    "@unifametro.edu.br"
                );


            if (!emailValido) {

                mostrarMensagem(
                    "Utilize seu e-mail institucional."
                );

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
                                    email:
                                        email,

                                    password:
                                        password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    mostrarMensagem(
                        data.error_description ||
                        data.msg ||
                        "E-mail ou senha incorretos."
                    );

                    return;

                }


                /* ======================================
                   SALVAR SESSÃO
                ====================================== */

                localStorage.setItem(
                    "access_token",
                    data.access_token
                );


                localStorage.setItem(
                    "refresh_token",
                    data.refresh_token
                );


                localStorage.setItem(
                    "user_id",
                    data.user.id
                );


                localStorage.setItem(
                    "user_email",
                    data.user.email
                );


                /* ======================================
                   IR PARA O DASHBOARD
                ====================================== */

                window.location.href =
                    "dashboard.html";

            }


            catch (error) {

                console.error(
                    "Erro no login:",
                    error
                );


                mostrarMensagem(
                    "Não foi possível conectar ao sistema."
                );

            }

        }
    );

}


/* =====================================================
   RECUPERAÇÃO DE SENHA
===================================================== */

const forgotPassword =
    document.getElementById(
        "forgot-password"
    );


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();


            const emailInput =
                document.getElementById("email");


            const email =
                emailInput
                    ? emailInput.value
                        .trim()
                        .toLowerCase()
                    : "";


            if (!email) {

                mostrarMensagem(
                    "Digite seu e-mail institucional primeiro."
                );

                if (emailInput) {
                    emailInput.focus();
                }

                return;

            }


            /* ==========================================
               VALIDAR E-MAIL
            ========================================== */

            const emailValido =
                email.endsWith(
                    "@aluno.unifametro.edu.br"
                ) ||
                email.endsWith(
                    "@professor.unifametro.edu.br"
                ) ||
                email.endsWith(
                    "@unifametro.edu.br"
                );


            if (!emailValido) {

                mostrarMensagem(
                    "Utilize seu e-mail institucional."
                );

                return;

            }


            mostrarMensagem(
                "Enviando e-mail de recuperação...",
                "success"
            );


            try {

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

                                    email:
                                        email,

                                    redirect_to:
                                        `${window.location.origin}/portal-reservas/redefinir-senha.html`

                                })
                        }
                    );


                if (!response.ok) {

                    const erro =
                        await response.json()
                            .catch(
                                () => ({})
                            );


                    console.error(
                        "Erro recuperação:",
                        erro
                    );


                    mostrarMensagem(
                        erro.msg ||
                        erro.message ||
                        "Não foi possível enviar o e-mail de recuperação."
                    );

                    return;

                }


                mostrarMensagem(
                    "E-mail de recuperação enviado! Verifique sua caixa de entrada e também a pasta de spam.",
                    "success"
                );

            }


            catch (error) {

                console.error(
                    "Erro recuperação:",
                    error
                );


                mostrarMensagem(
                    "Não foi possível enviar o e-mail de recuperação."
                );

            }

        }
    );

}
