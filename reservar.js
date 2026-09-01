const SUPABASE_URL =
    "https://walmglpuysduteeiwybh.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_VROzleLIlpKkECuqWVqzXw_rUwTMpd6";


/* =====================================================
   VERIFICAR LOGIN
===================================================== */

const accessToken =
    localStorage.getItem("access_token");

const refreshToken =
    localStorage.getItem("refresh_token");


if (!accessToken) {

    window.location.href = "index.html";

}


/* =====================================================
   ELEMENTOS DA PÁGINA
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
   CABEÇALHOS PARA O SUPABASE
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
   OBTER TIPO DO AMBIENTE
===================================================== */

function obterTipoAmbiente() {

    const option =
        ambienteSelect.options[
            ambienteSelect.selectedIndex
        ];

    if (!option || !option.value) {

        return null;

    }

    return option.dataset.tipo || null;

}


/* =====================================================
   OBTER ANTECEDÊNCIA MÍNIMA
===================================================== */

function obterAntecedenciaHoras() {

    const tipo =
        obterTipoAmbiente();


    /*
       LABORATÓRIOS
       48 horas
    */

    if (tipo === "laboratorio") {

        return 48;

    }


    /*
       TUTORIA
       24 horas
    */

    if (
        tipo === "tutoria" ||
        tipo === "sala_tutoria"
    ) {

        return 24;

    }


    /*
       OUTROS AMBIENTES
       72 horas
    */

    return 72;

}


/* =====================================================
   OBTER NOME DA REGRA
===================================================== */

function obterNomeRegra() {

    const tipo =
        obterTipoAmbiente();


    if (tipo === "laboratorio") {

        return "laboratórios";

    }


    if (
        tipo === "tutoria" ||
        tipo === "sala_tutoria"
    ) {

        return "salas de tutoria";

    }


    return "este ambiente";

}


/* =====================================================
   VALIDAR ANTECEDÊNCIA
===================================================== */

function validarAntecedencia() {

    if (
        !ambienteSelect.value ||
        !dataInput.value ||
        !inicioInput.value
    ) {

        return true;

    }


    const horasMinimas =
        obterAntecedenciaHoras();


    /*
       Criar a data/hora escolhida pelo usuário.
    */

    const dataHoraReserva =
        new Date(
            `${dataInput.value}T${inicioInput.value}:00`
        );


    /*
       Momento atual + antecedência mínima.
    */

    const limite =
        new Date(
            Date.now() +
            horasMinimas *
            60 *
            60 *
            1000
        );


    /*
       Se a reserva estiver antes do limite,
       ela não pode ser realizada.
    */

    if (
        dataHoraReserva <
        limite
    ) {

        const nomeRegra =
            obterNomeRegra();


        availability.innerHTML =
            `⚠️ A reserva para ${nomeRegra} ` +
            `deve ser realizada com pelo menos ` +
            `<strong>${horasMinimas} horas de antecedência</strong>.`;


        availability.dataset.available =
            "false";


        return false;

    }


    return true;

}


/* =====================================================
   CARREGAR AMBIENTES
===================================================== */

async function carregarAmbientes() {

    ambienteSelect.innerHTML =
        `<option value="">
            Carregando ambientes...
        </option>`;


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/ambientes?ativo=eq.true&select=id,nome,tipo,capacidade&order=nome`,
                {
                    method: "GET",
                    headers: headers()
                }
            );


        if (!response.ok) {

            const erro =
                await response.text();


            console.error(
                "ERRO SUPABASE:",
                response.status,
                erro
            );


            ambienteSelect.innerHTML =
                `<option value="">
                    Erro ${response.status}
                </option>`;


            environmentInfo.innerHTML =
                `<strong>
                    Erro ao carregar ambientes.
                </strong>
                <br><br>
                Código: ${response.status}
                <br><br>
                ${erro}`;


            return;

        }


        const ambientes =
            await response.json();


        console.log(
            "Ambientes recebidos:",
            ambientes
        );


        if (
            !Array.isArray(ambientes) ||
            ambientes.length === 0
        ) {

            ambienteSelect.innerHTML =
                `<option value="">
                    Nenhum ambiente disponível
                </option>`;


            environmentInfo.innerHTML =
                "Não existem ambientes ativos cadastrados.";


            return;

        }


        ambienteSelect.innerHTML =
            `<option value="">
                Selecione um ambiente
            </option>`;


        ambientes.forEach(
            function(ambiente) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    ambiente.id;


                option.textContent =
                    ambiente.nome;


                option.dataset.tipo =
                    ambiente.tipo;


                option.dataset.capacidade =
                    ambiente.capacidade || "";


                ambienteSelect.appendChild(
                    option
                );

            }
        );


        console.log(
            "Ambientes carregados com sucesso."
        );

    }


    catch (error) {

        console.error(
            "ERRO DE CONEXÃO:",
            error
        );


        ambienteSelect.innerHTML =
            `<option value="">
                Erro de conexão
            </option>`;


        environmentInfo.innerHTML =
            `<strong>
                Erro de conexão com o Supabase.
            </strong>
            <br><br>
            ${error.message}`;

    }

}


/* =====================================================
   QUANDO ESCOLHER UM AMBIENTE
===================================================== */

ambienteSelect.addEventListener(
    "change",
    function() {

        const option =
            ambienteSelect.options[
                ambienteSelect.selectedIndex
            ];


        if (!option.value) {

            environmentInfo.textContent = "";

            availability.textContent = "";

            availability.dataset.available = "";

            return;

        }


        /* ==========================================
           LABORATÓRIO
        ========================================== */

        if (
            option.dataset.tipo ===
            "laboratorio"
        ) {

            environmentInfo.innerHTML =

                "🧬 <strong>Laboratório:</strong> " +
                "é necessário reservar com pelo menos " +
                "<strong>48 horas de antecedência</strong>. " +
                "Duração máxima de 2 horas.";

        }


        /* ==========================================
           TUTORIA
        ========================================== */

        else if (
            option.dataset.tipo ===
            "tutoria" ||
            option.dataset.tipo ===
            "sala_tutoria"
        ) {

            environmentInfo.innerHTML =

                "📚 <strong>Sala de Tutoria:</strong> " +
                "é necessário reservar com pelo menos " +
                "<strong>24 horas de antecedência</strong>. " +
                "Duração máxima de 2 horas.";

        }


        /* ==========================================
           OUTROS AMBIENTES
        ========================================== */

        else {

            environmentInfo.innerHTML =

                "🏫 <strong>Ambiente:</strong> " +
                "é necessário reservar com pelo menos " +
                "<strong>72 horas de antecedência</strong>. " +
                "Duração máxima de 2 horas.";

        }


        verificarDisponibilidade();

    }
);


/* =====================================================
   VERIFICAR DISPONIBILIDADE
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

        availability.dataset.available = "";

        return;

    }


    /* ==========================================
       HORÁRIO INVÁLIDO
    ========================================== */

    if (inicio >= fim) {

        availability.innerHTML =
            "⚠️ O horário de término deve ser posterior ao início.";


        availability.dataset.available =
            "false";


        return;

    }


    /* ==========================================
       VERIFICAR LIMITE DE 2 HORAS
    ========================================== */

    const inicioMinutos =
        converterMinutos(inicio);

    const fimMinutos =
        converterMinutos(fim);


    const duracao =
        fimMinutos -
        inicioMinutos;


    if (duracao > 120) {

        availability.innerHTML =
            "⚠️ A duração máxima da reserva é de 2 horas.";


        availability.dataset.available =
            "false";


        return;

    }


    /* ==========================================
       VERIFICAR ANTECEDÊNCIA
    ========================================== */

    if (
        !validarAntecedencia()
    ) {

        return;

    }


    /* ==========================================
       CONSULTAR RESERVAS
    ========================================== */

    try {

        const reservasResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/reservas?ambiente_id=eq.${ambiente}&data=eq.${data}&status=neq.cancelada&select=hora_inicio,hora_fim`,
                {
                    method: "GET",
                    headers: headers()
                }
            );


        if (!reservasResponse.ok) {

            const erro =
                await reservasResponse.text();


            console.error(
                "ERRO AO CONSULTAR RESERVAS:",
                erro
            );


            availability.innerHTML =
                "⚠️ Não foi possível verificar a disponibilidade.";


            availability.dataset.available =
                "false";


            return;

        }


        const reservas =
            await reservasResponse.json();


        /* ==========================================
           PROCURAR CONFLITO
        ========================================== */

        const conflito =
            reservas.some(
                function(reserva) {

                    return (

                        reserva.hora_inicio <
                        fim &&

                        reserva.hora_fim >
                        inicio

                    );

                }
            );


        if (conflito) {

            availability.innerHTML =
                "<strong>❌ Horário indisponível.</strong> " +
                "Já existe uma reserva neste período.";


            availability.dataset.available =
                "false";

        }


        else {

            availability.innerHTML =
                "<strong>✓ Horário disponível.</strong>";


            availability.dataset.available =
                "true";

        }

    }


    catch (error) {

        console.error(
            "ERRO DE CONEXÃO:",
            error
        );


        availability.innerHTML =
            "⚠️ Erro ao verificar disponibilidade.";


        availability.dataset.available =
            "false";

    }

}


/* =====================================================
   VERIFICAR QUANDO DATA OU HORÁRIO MUDAR
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
                    ? Number(
                        quantidadeInput.value
                    )
                    : null;


            /* ==========================================
               VALIDAR AMBIENTE
            ========================================== */

            if (!ambiente) {

                message.textContent =
                    "Selecione um ambiente.";

                return;

            }


            /* ==========================================
               VALIDAR DATA
            ========================================== */

            if (!data) {

                message.textContent =
                    "Selecione uma data.";

                return;

            }


            /* ==========================================
               VALIDAR HORÁRIO
            ========================================== */

            if (inicio >= fim) {

                message.textContent =
                    "O horário de término deve ser posterior ao início.";

                return;

            }


            /* ==========================================
               VALIDAR DURAÇÃO
            ========================================== */

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


            /* ==========================================
               VALIDAR ANTECEDÊNCIA
            ========================================== */

            if (
                !validarAntecedencia()
            ) {

                message.textContent =
                    "A reserva não atende à antecedência mínima exigida.";

                return;

            }


            /* ==========================================
               VERIFICAR DISPONIBILIDADE NOVAMENTE
            ========================================== */

            await verificarDisponibilidade();


            if (
                availability.dataset.available !==
                "true"
            ) {

                message.textContent =
                    "Não é possível realizar a reserva nesse horário.";

                return;

            }


            /* ==========================================
               OBTER USUÁRIO LOGADO
            ========================================== */

            const userResponse =
                await fetch(
                    `${SUPABASE_URL}/auth/v1/user`,
                    {
                        method: "GET",
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

                        body:
                            JSON.stringify({

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


            /* ==========================================
               ERRO AO CRIAR RESERVA
            ========================================== */

            if (!reservaResponse.ok) {

                console.error(
                    "ERRO AO CRIAR RESERVA:",
                    resultado
                );


                message.innerHTML =
                    `<strong>
                        Não foi possível realizar a reserva.
                    </strong>
                    <br><br>
                    ${
                        resultado.message ||
                        resultado.error_description ||
                        "Erro desconhecido."
                    }`;

                return;

            }


            /* ==========================================
               SUCESSO
            ========================================== */

            message.innerHTML =
                "✅ <strong>Reserva realizada com sucesso!</strong>";


            document
                .getElementById(
                    "reservationForm"
                )
                .reset();


            environmentInfo.textContent =
                "";


            availability.textContent =
                "";


            availability.dataset.available =
                "";


            /* ==========================================
               RECARREGAR AMBIENTES
            ========================================== */

            await carregarAmbientes();

        }
    );


/* =====================================================
   CONVERTER HORÁRIO PARA MINUTOS
===================================================== */

function converterMinutos(
    horario
) {

    const partes =
        horario.split(":");


    return (

        Number(partes[0]) * 60 +

        Number(partes[1])

    );

}


/* =====================================================
   SAIR
===================================================== */

function logout() {

    localStorage.removeItem(
        "access_token"
    );


    localStorage.removeItem(
        "refresh_token"
    );


    localStorage.removeItem(
        "user_id"
    );


    localStorage.removeItem(
        "user_email"
    );


    window.location.href =
        "index.html";

}


/* =====================================================
   CONFIGURAR DATA MÍNIMA
===================================================== */

function configurarDataMinima() {

    const hoje =
        new Date();


    const ano =
        hoje.getFullYear();


    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            hoje.getDate()
        ).padStart(
            2,
            "0"
        );


    dataInput.min =
        `${ano}-${mes}-${dia}`;

}


/* =====================================================
   INICIAR PÁGINA
===================================================== */

configurarDataMinima();

carregarAmbientes();
