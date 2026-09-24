document.addEventListener(
    "DOMContentLoaded",
    () => {
        /*
         * Todo o código da aplicação
         * ficará dentro desta função.
         */

        const scene =
            document.querySelector("#ar-scene");

        const target =
            document.querySelector("#target");

        const cameraElement =
            document.querySelector("#ar-camera");

        const status =
            document.querySelector("#status");

        const badge =
            document.querySelector("#badge");

        const panel =
            document.querySelector("#info-panel");

        const panelTitle =
            document.querySelector("#info-title");

        const panelText =
            document.querySelector("#info-text");

        const panelDetail =
            document.querySelector("#info-detail");

        const closeButton =
            document.querySelector("#close-panel");

        const hotspots =
            Array.from(
                document.querySelectorAll(
                    ".hotspot"
                )
            );

        /*
         * false: target não está sendo rastreado.
         * true: target está sendo rastreado.
         */
        let tracking = false;

        const information = {
            placa: {
                title:
                    "Cabeçote e placa",
                text:
                    "A placa fixa a peça e o cabeçote fornece o movimento de rotação necessário ao torneamento.",
                detail:
                    "A fixação correta é essencial para precisão e segurança."
            },

            torre: {
                title:
                    "Torre de ferramentas",
                text:
                    "A torre organiza as ferramentas de corte e permite selecionar a ferramenta necessária em cada etapa do programa CNC.",
                detail:
                    "A indexação da torre pode integrar a sequência automática de usinagem."
            },

            comando: {
                title:
                    "Painel de comando CNC",
                text:
                    "O painel é a interface entre operador, programa CNC e sistema de controle da máquina.",
                detail:
                    "Os dados apresentados nesta experiência são didáticos."
            },

            seguranca: {
                title:
                    "Proteção e segurança",
                text:
                    "Portas, proteções e intertravamentos ajudam a separar o operador da região de usinagem.",
                detail:
                    "A Realidade Aumentada não substitui treinamento ou documentação do fabricante."
            }
        };

        function showInformation(topicName) {
            const selected =
                information[topicName];

            /*
             * Se não existir informação
             * para o tópico, encerra.
             */
            if (!selected) {
                return;
            }

            panelTitle.textContent =
                selected.title;

            panelText.textContent =
                selected.text;

            panelDetail.textContent =
                selected.detail;

            /*
             * Exibe o painel.
             */
            panel.classList.remove(
                "hidden"
            );
        }

        function hideInformation() {
            panel.classList.add(
                "hidden"
            );
        }

        /*
         * Eventos dos hotspots.
         */
        hotspots.forEach(
            (button) => {
                button.addEventListener(
                    "pointerup",
                    (event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        const topicName =
                            button.dataset.topic;

                        showInformation(
                            topicName
                        );
                    }
                );
            }
        );

        /*
         * Botão para fechar o painel.
         */
        closeButton.addEventListener(
            "pointerup",
            (event) => {
                event.preventDefault();
                event.stopPropagation();

                hideInformation();
            }
        );

        /*
         * RA pronta.
         */
        scene.addEventListener(
            "arReady",
            () => {
                status.textContent =
                    "Câmera pronta. Aponte para a imagem do torno.";

                badge.textContent =
                    "PROCURANDO ALVO";
            }
        );

        /*
         * Erro na inicialização da RA.
         */
        scene.addEventListener(
            "arError",
            () => {
                status.textContent =
                    "Não foi possível iniciar a câmera.";

                badge.textContent =
                    "ERRO";
            }
        );

        /*
         * Alvo encontrado.
         */
        target.addEventListener(
            "targetFound",
            () => {
                tracking = true;

                status.textContent =
                    "Torno reconhecido. Toque em um ponto numerado.";

                badge.textContent =
                    "● RA ATIVA";

                hotspots.forEach(
                    (button) => {
                        button.classList.add(
                            "visible"
                        );
                    }
                );
            }
        );

        /*
         * Alvo perdido.
         */
        target.addEventListener(
            "targetLost",
            () => {
                tracking = false;

                status.textContent =
                    "Alvo perdido. Aponte novamente para a imagem.";

                badge.textContent =
                    "PROCURANDO ALVO";

                hotspots.forEach(
                    (button) => {
                        button.classList.remove(
                            "visible"
                        );

                        button.style.visibility =
                            "hidden";
                    }
                );

                hideInformation();
            }
        );

        /*
         * Obtém a câmera do A-Frame.
         */
        const camera =
            cameraElement.getObject3D(
                "camera"
            );

        /*
         * Verifica se os objetos necessários
         * existem antes de continuar.
         */
        if (!camera || !target.object3D) {
            console.error(
                "Câmera ou objeto do alvo não encontrado."
            );

            return;
        }

        /*
         * Atualiza a posição dos hotspots
         * com base nas coordenadas 3D do alvo.
         */
        function updateHotspotPositions() {

            /*
             * Agenda a próxima atualização.
             */
            requestAnimationFrame(
                updateHotspotPositions
            );

            /*
             * Sem tracking, não precisamos
             * calcular as posições.
             */
            if (!tracking) {
                return;
            }

            target.object3D.updateMatrixWorld(
                true
            );

            camera.updateMatrixWorld(
                true
            );

            hotspots.forEach(
                (button) => {

                    /*
                     * Lê as coordenadas definidas
                     * nos atributos data-x,
                     * data-y e data-z.
                     */
                    const localPoint =
                        new THREE.Vector3(
                            Number(
                                button.dataset.x
                            ),
                            Number(
                                button.dataset.y
                            ),
                            Number(
                                button.dataset.z
                            )
                        );

                    /*
                     * Converte o ponto local do alvo
                     * para coordenadas do mundo.
                     */
                    const worldPoint =
                        target.object3D.localToWorld(
                            localPoint
                        );

                    /*
                     * Projeta o ponto 3D
                     * para coordenadas da tela.
                     */
                    const projectedPoint =
                        worldPoint
                            .clone()
                            .project(
                                camera
                            );

                    /*
                     * Converte NDC para pixels.
                     */
                    const screenX =
                        (
                            projectedPoint.x *
                            0.5 +
                            0.5
                        ) *
                        window.innerWidth;

                    const screenY =
                        (
                            -projectedPoint.y *
                            0.5 +
                            0.5
                        ) *
                        window.innerHeight;

                    /*
                     * Posiciona o hotspot.
                     */
                    button.style.left =
                        `${screenX}px`;

                    button.style.top =
                        `${screenY}px`;

                    /*
                     * Verifica se o ponto está
                     * dentro da área visível.
                     */
                    const insideScreen =
                        projectedPoint.z > -1 &&
                        projectedPoint.z < 1 &&
                        screenX > -80 &&
                        screenX <
                        window.innerWidth + 80 &&
                        screenY > -80 &&
                        screenY <
                        window.innerHeight + 80;

                    button.style.visibility =
                        insideScreen
                            ? "visible"
                            : "hidden";
                }
            );
        }

        /*
         * Primeira chamada.
         * As próximas serão agendadas
         * por requestAnimationFrame().
         */
        updateHotspotPositions();
    }
);
