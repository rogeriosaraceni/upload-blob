$(document).ready(function() {
    let splide = null;
    let images = [];

    // Função de validação de arquivos
    function validateFileInput(inputFile) {
        const input = inputFile;
        const maxSize = parseInt(input.dataset.size, 10); // Tamanho máximo em bytes
        const extensionsText = input.dataset.accept || '';
        const extensions = extensionsText ? new RegExp(`(${extensionsText.replace(/,/g, '|')})$`, 'i') : null;

        if (input.files && input.files.length > 0) {
            for (const file of input.files) {
                const fileName = file.name;

                // Validação de extensão
                if (extensions && !extensions.test(fileName)) {
                    alert(`Fora das extensões permitidas: ${extensionsText}`);
                    input.value = ''; // Limpar o input
                    return false;
                }

                // Validação de tamanho
                if (maxSize && file.size > maxSize) {
                    const maxMB = (maxSize / (1024 * 1024)).toFixed(0).replace('.', ',');
                    alert(`Excede o tamanho máximo de ${maxMB} MB`);
                    input.value = ''; // Limpar o input
                    return false;
                }
            }
        }
        return true; // Todos os arquivos são válidos
    }

    // Manipular seleção de arquivos
    $('#image-upload').on('change', function() {
        const files = this.files;
        // Validar arquivos antes de processar
        if (files.length > 0 && validateFileInput(this)) {
            handleFiles(files);
        }
    });

    // Função para processar os arquivos
    function handleFiles(files) {
        let processedImages = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Ignorar arquivos que não são imagens (já validados, mas mantido por segurança)
            if (!file.type.match('image.*')) continue;

            const index = Date.now() + i;
            const objectUrl = URL.createObjectURL(file);

            // Adicionar à lista de imagens
            images.push({
                id: index,
                name: file.name,
                src: objectUrl,
                file: file
            });

            // Adicionar preview com botão de deletar
            $('#image-list').append(
                `<li data-image-id="${index}">
                    <img src="${objectUrl}" class="image-preview" title="${file.name}">
                    <button type="button" class="btn-del" data-image-id="${index}">
                        <i class="bi bi-x-circle-fill"></i>
                    </button>
                </li>`
            );

            // Adicionar evento de clique para o botão de deletar
            $(`button[data-image-id="${index}"]`).on('click', function() {
                const imageId = $(this).data('image-id');
                if (confirm('Tem certeza que deseja remover esta imagem?')) {
                    deleteImage(imageId);
                }
            });

            processedImages++;

            // Mostrar o container de imagens na primeira imagem
            $('#selected-files').removeClass('hidden');

            // Atualizar o slider após todas as imagens válidas serem processadas
            if (processedImages === files.length) {
                updateSlider();
            }
        }
    }

      // Função para deletar imagem
    function deleteImage(imageId) {
        // Encontrar a imagem para liberar a URL
        const image = images.find(img => img.id === imageId);
        if (image) {
            URL.revokeObjectURL(image.src); // Liberar a URL
        }

        // Remover a imagem do array
        images = images.filter(img => img.id !== imageId);

        // Remover o preview da imagem
        $(`li[data-image-id="${imageId}"]`).remove();

        // Atualizar o slider
        updateSlider();

        // Se não houver mais imagens, mostrar a mensagem
        if (images.length === 0) {
            $('#selected-files').addClass('hidden');
        }
    }

    // Função para atualizar o slider com as imagens
    function updateSlider() {
        if (images.length === 0) {
            $('#no-images-message').removeClass('hidden');
            $('#image-carousel').addClass('hidden');
            return;
        }

        $('#no-images-message').addClass('hidden');
        $('#image-carousel').removeClass('hidden');

        // Limpar slides existentes
        $('.splide__list').empty();

        // Adicionar novas imagens
        images.forEach(function(image) {
            $('.splide__list').append(
                `<li class="splide__slide">
                    <img src="${image.src}" alt="${image.name}">
                </li>`
            );
        });

        // Destruir instância anterior do Splide se existir
        if (splide) {
            splide.destroy();
        }

        // Inicializar o Splide
        splide = new Splide('#image-carousel', {
            type: 'loop',
            perPage: 1,
            autoplay: true,
            interval: 6000,
            pauseOnHover: true,
            pagination: true,
            arrows: true
        }).mount();

        console.log(images);
    }

    // Inicialmente, esconder o slider e mostrar a mensagem
    updateSlider();


    $('#form-upload').on('submit', function(e) {
        e.preventDefault();

        if (images.length > 0) {
            console.log(images);
        } else {
            alert('Nenhuma imagem selecionada.');
        }
    });
});
