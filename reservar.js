const SUPABASE_URL =
    "https://aoyvwjbhwaermlapxvkq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IxQS_KAQbFja1ljfrbNMSg_A9yk8AlQ";


const accessToken =
    localStorage.getItem("access_token");

const refreshToken =
    localStorage.getItem("refresh_token");


if (!accessToken) {

    window.location.href = "index.html";

}


/* =====================================================
   ELEMENTOS
===================================================== */

const ambienteSelect =
    document.getElementById("ambiente");

const dataInput =
    document.getElementById("data");

const inicioInput =
    document.getElementById("hora_inicio");

const fimInput =
    document.getElementById("hora_fim");

const finalidadeInput =
    document.getElementById("finalidade");

const quantidadeInput =
    document.getElementById("quantidade");

const message =
    document.getElementById("message");

const availability =
    document.getElementById("availability");

const environmentInfo =
    document.getElementById("environmentInfo");


/* =====================================================
   CABEÇALHOS
===================================================== */

function headers() {

    return {

        "Content-Type":
            "application/json",

        "apikey":
            SUPABASE_KEY,

        "Authorization":
            `Bearer ${accessToken}`

    };

}


/* =====================================================
   CARREGAR AMBIENTES
===================================================== */

async function carregarAmbientes() {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/ambientes?ativo=eq.true&select=id,nome,tipo,capacidade&order=nome`,
        {
            headers: headers()
        }
    );


    if (!response.ok) {

        console.error(
            await response.text()
        );

        ambienteSelect.innerHTML =
            `<option value="">
                Erro ao carregar ambientes
            </option>`;

        return;

    }


    const ambientes =
        await response.json();


    ambienteSelect.innerHTML =
        `<option value="">
            Selecione um ambiente
        </option>`;


    ambientes.forEach(ambiente => {

        const option =
            document.createElement("option");

        option.value =
            ambiente.id;

        option.textContent =
            ambiente.nome;

        option.dataset.tipo =
            ambiente.tipo;

        option.dataset.capacidade =
            ambiente.capacidade || "";

        ambienteSelect.appendChild(option);

    });

}


/* =====================================================
   INFORMAÇÕES DO AMBIENTE
===================================================== */

ambienteSelect.addEventListener(
    "change",
    function () {

        const option =
            ambienteSelect.options[
                ambienteSelect.selectedIndex
            ];


        if (!option.value) {

            environmentInfo.textContent = "";

            return;

        }


        if (option.dataset.tipo === "laboratorio") {

            environmentInfo.innerHTML =
                "🧬 Laboratório: é necessário reservar com pelo menos <strong>48 horas de antecedência</strong>. Duração máxima de 2 horas.";

        } else {

            environmentInfo.innerHTML =
                "📚 Sala de Tutoria: reserva livre conforme disponibilidade. Duração máxima de 2 horas.";

        }

        verificarDisponibilidade();

    }
);


/* =====================================================
   VERIFICAR CONFLITOS
===================================================== */

async function verificarDisponibilidade() {

    const ambiente =
        ambienteSelect.value;

    const data =
        dataInput.value;

    const inicio =
        inicioInput.value;

    const fim =
        fimInput.value;


    if (
        !ambiente ||
        !data ||
        !inicio ||
        !fim
    ) {

        availability.textContent = "";

        return;

    }


    if (inicio >= fim) {

        availability.textContent =
            "⚠️ O horário de término deve ser posterior ao início.";

        return;

    }


    const reservasResponse =
        await fetch(
            `${SUPABASE_URL}/rest/v1/reservas?ambiente_id=eq.${ambiente}&data=eq.${data}&status=neq.cancelada&select=hora_inicio,hora_fim`,
            {
                headers: headers()
            }
        );


    if (!reservasResponse.ok) {

        availability.textContent =
            "Não foi possível verificar a disponibilidade.";

        return;

    }


    const reservas =
        await reservasResponse.json();


    const conflito =
        reservas.some(reserva => {

            return (
                reserva.hora_inicio < fim &&
                reserva.hora_fim > inicio
            );

        });


    if (conflito) {

        availability.innerHTML =
            "<strong>❌ Horário indisponível.</strong> Já existe uma reserva neste período.";

        availability.dataset.available =
            "false";

    } else {

        availability.innerHTML =
            "<strong>✓ Horário disponível.</strong>";

        availability.dataset.available =
            "true";

    }

}


/* =====================================================
   VERIFICAR QUANDO DATA/HORÁRIO MUDAR
===================================================== */

dataInput.addEventListener(
    "change",
    verificarDisponibilidade
);

inicioInput.addEventListener(
    "change",
    verificarDisponibilidade
);

fimInput.addEventListener(
    "change",
    verificarDisponibilidade
);


/* =====================================================
   ENVIAR RESERVA
===================================================== */

document
    .getElementById("reservationForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            message.textContent =
                "Verificando reserva...";


            const ambiente =
                ambienteSelect.value;

            const data =
                dataInput.value;

            const inicio =
                inicioInput.value;

            const fim =
                fimInput.value;

            const finalidade =
                finalidadeInput.value.trim();

            const quantidade =
                quantidadeInput.value
                    ? Number(quantidadeInput.value)
                    : null;


            if (!ambiente) {

                message.textContent =
                    "Selecione um ambiente.";

                return;

            }


            if (inicio >= fim) {

                message.textContent =
                    "O horário de término deve ser posterior ao início.";

                return;

            }


            const inicioMinutos =
                converterMinutos(inicio);

            const fimMinutos =
                converterMinutos(fim);


            if (
                fimMinutos -
                inicioMinutos >
                120
            ) {

                message.textContent =
                    "A duração máxima da reserva é de 2 horas.";

                return;

            }


            await verificarDisponibilidade();


            if (
                availability.dataset.available ===
                "false"
            ) {

                message.textContent =
                    "Esse horário já está ocupado.";

                return;

            }


            /* ==========================================
               PEGAR USUÁRIO LOGADO
            ========================================== */

            const userResponse =
                await fetch(
                    `${SUPABASE_URL}/auth/v1/user`,
                    {
                        headers: headers()
                    }
                );


            if (!userResponse.ok) {

                message.textContent =
                    "Sua sessão expirou. Faça login novamente.";

                return;

            }


            const user =
                await userResponse.json();


            /* ==========================================
               CRIAR RESERVA
            ========================================== */

            const reservaResponse =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/reservas`,
                    {

                        method: "POST",

                        headers: {
                            ...headers(),

                            "Prefer":
                                "return=representation"

                        },

                        body: JSON.stringify({

                            usuario_id:
                                user.id,

                            ambiente_id:
                                ambiente,

                            data:
                                data,

                            hora_inicio:
                                inicio,

                            hora_fim:
                                fim,

                            finalidade:
                                finalidade,

                            quantidade_pessoas:
                                quantidade

                        })

                    }
                );


            const resultado =
                await reservaResponse.json();


            if (!reservaResponse.ok) {

                console.error(resultado);

                message.textContent =
                    resultado.message ||
                    "Não foi possível realizar a reserva.";

                return;

            }


            message.innerHTML =
                "✅ <strong>Reserva realizada com sucesso!</strong>";


            document
                .getElementById("reservationForm")
                .reset();


            environmentInfo.textContent = "";

            availability.textContent = "";


        }
    );


/* =====================================================
   CONVERTER HORÁRIO PARA MINUTOS
===================================================== */

function converterMinutos(horario) {

    const partes =
        horario.split(":");

    return (
        Number(partes[0]) * 60 +
        Number(partes[1])
    );

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "refresh_token"
    );

    window.location.href =
        "index.html";

}


/* =====================================================
   DATA MÍNIMA
===================================================== */

function configurarDataMinima() {

    const hoje =
        new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");


    dataInput.min =
        `${ano}-${mes}-${dia}`;

}


configurarDataMinima();

carregarAmbientes();
