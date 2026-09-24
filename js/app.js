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
        let tracking =
            false;
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
                    "A torre organiza as ferramentas de corte e permite selecionar a ferramenta necessária em cada etapa do programaCNC.",
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
        function showInformation(
            topicName
        ) {
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

        closeButton.addEventListener(
            "pointerup",
            (event) => {
                event.preventDefault();
                hideInformation();
            }
        );

        scene.addEventListener(
            "arReady",
            () => {
                status.textContent =
                    "Câmera pronta. Aponte para a imagem do torno.";
                badge.textContent =
                    "PROCURANDO ALVO";
            }
        );

        scene.addEventListener(
            "arError",
            () => {
                status.textContent =
                    "Não foi possível iniciar a câmera.";
                badge.textContent =
                    "ERRO";
            }
        );

        target.addEventListener(
            "targetFound",
            () => {
                tracking =
                    true;

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

        target.addEventListener(
            "targetLost",
            () => {
                tracking =
                    false;

                status.textContent =
                    "Alvo perdido. Aponte novamente para a imagem.";
                badge.textContent =
                    "PROCURANDO ALVO";

                hotspots.forEach(
                    (button) => {
                        button.classList.remove(
                            "visible"
                        );
                    }
                );

                hideInformation();
            }
        );

        function updateHotspotPositions() {
            /*
            * Agenda a próxima atualização.
            */
            requestAnimationFrame(
                updateHotspotPositions
            );

            /*
            * Sem tracking, interrompe
            * os cálculos deste quadro.
            */
            if (!tracking) {
                return;
            }
        }

        const camera =
            cameraElement.getObject3D(
                "camera"
            );

        if (
            !camera ||
            !target.object3D
        ) {
            return;
        }

        target.object3D.updateMatrixWorld(
            true
        );
        camera.updateMatrixWorld(
            true
        );
        const localPoint =
            new THREE.Vector3(
                Number(button.dataset.x),
                Number(button.dataset.y),
                Number(button.dataset.z)
            );
        const worldPoint =
            target.object3D.localToWorld(
                localPoint
            );
        const projectedPoint =
            worldPoint
                .clone()
                .project(
                    camera
                );
        const screenX =
            (
                projectedPoint.x * 0.5 +
                0.5
            ) *
            window.innerWidth;
        const screenY =
            (
                -projectedPoint.y * 0.5 +
                0.5
            ) *
            window.innerHeight;
        button.style.left =
            `${screenX}px`;
        button.style.top =
            `${screenY}px`;
        const insideScreen =
            projectedPoint.z > -1 &&
            projectedPoint.z < 1 &&
            screenX > -80 &&
            screenX < window.innerWidth + 80 &&
            screenY > -80 &&
            screenY < window.innerHeight + 80;

        button.style.visibility =
            insideScreen
                ? "visible"
                : "hidden";
        /*
        * Primeira chamada.
        * As próximas serão agendadas
        * por requestAnimationFrame().
        */
        updateHotspotPositions();









    }
);

