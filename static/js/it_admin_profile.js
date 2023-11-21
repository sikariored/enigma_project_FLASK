document.addEventListener("DOMContentLoaded", function() {
    // Функционал кнопок Битрикс24 и Почта
    var bitrix24Button = document.getElementById('bitrix24-button');
    var emailButton = document.getElementById('email-button');

    function setResourceValue(value) {
        var resourceField = document.getElementById('resource');
        resourceField.value = value;
    }

    bitrix24Button.addEventListener('click', function() {
        setResourceValue('Битрикс24');
    });

    emailButton.addEventListener('click', function() {
        setResourceValue('Email');
    });

    // Функция для генерации случайного пароля
    function generatePassword(length) {
        const charset = "abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-]+$";
        let password = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset.charAt(randomIndex);
        }

        return password;
    }

    var passwordField = document.getElementById('password');
    var generatePasswordButton = document.getElementById('generate-password-button');

    generatePasswordButton.addEventListener('click', function() {
        var generatedPassword = generatePassword(18); // Измените длину пароля, если нужно
        passwordField.value = generatedPassword;

        // После генерации пароля вызываем событие input
        var event = new Event('input', {
            bubbles: true,
            cancelable: true,
        });
        passwordField.dispatchEvent(event);
    });

    // Видимость заводимого пароля
    var showPasswordButton = document.getElementById('show-password-button');
    var isPasswordVisible = false;

    showPasswordButton.addEventListener('click', function() {
        isPasswordVisible = !isPasswordVisible;
        passwordField.type = isPasswordVisible ? 'text' : 'password';
    });

    // Кнопка "Копировать" в таблице
    const copyButtons = document.querySelectorAll('.copy-password-button');

    copyButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const index = Array.from(copyButtons).indexOf(button);

            if (index !== -1) {
                const passwordToCopy = passwords[index];

                const tempInput = document.createElement('input');
                tempInput.value = passwordToCopy;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
            }
        });
    });

    // Фильтрация
    // SELECT
    var filterUsernameSelect = document.getElementById('filter-username-select');
    var tableRows = document.querySelectorAll('#table-users-info tbody tr');

    // Функция для получения уникальных имен из таблицы
    function getUniqueUsernames() {
        var uniqueUsernames = new Set();
        tableRows.forEach(function(row) {
            var usernameCell = row.querySelector('td[data-filter="username"]').textContent;
            uniqueUsernames.add(usernameCell);
        });
        return Array.from(uniqueUsernames);
    }

    // Заполнение выпадающего списка уникальными именами
    var uniqueUsernames = getUniqueUsernames();
    uniqueUsernames.forEach(function(username) {
        var option = document.createElement('option');
        option.value = username;
        option.textContent = username;
        filterUsernameSelect.appendChild(option);
    });

    // Обработчик события при изменении выбора в списке
    filterUsernameSelect.addEventListener('change', function() {
        var selectedUsername = filterUsernameSelect.value.toLowerCase();

        tableRows.forEach(function(row) {
            var usernameCell = row.querySelector('td[data-filter="username"]').textContent.toLowerCase();

            if (selectedUsername === '' || usernameCell === selectedUsername) {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // INPUT
    var filterUsernameInput = document.getElementById('filter-username-input');

    filterUsernameInput.addEventListener('input', function() {
        var filterValue = filterUsernameInput.value.toLowerCase();

        tableRows.forEach(function(row) {
            var usernameCell = row.querySelector('td[data-filter="username"]').textContent.toLowerCase();

            if (usernameCell.includes(filterValue)) {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    });

    //input username in add user
    $("#username").select2({
        ajax: {
            url: "/get_suggestions",
            dataType: "json",
            delay: 250,
            data: function(params) {
                return {
                    q: params.term
                };
            },
            processResults: function(data) {
                return {
                    results: data.results
                };
            },
            cache: true
        },
        minimumInputLength: 0,
        placeholder: 'Пользователь', // Добавим подсказку для пустого поля
        allowClear: true, // Разрешим очищение поля
    });

    // Обработчик события select2:select
    $("#username").on("select2:select", function (e) {
        var selectedData = e.params.data;
        // Устанавливаем выбранное значение в поле ввода
        $("#username").val(selectedData.text).trigger("change.select2");
    });

    // Обработчик события select2:unselect (очищение поля)
    $("#username").on("select2:unselect", function (e) {
        // Сбрасываем значение в поле ввода
        $("#username").val("").trigger("change");
    });


    //Проверка силы пароля


    // Получение элементов
    var passwordField = document.getElementById('password');
    var passwordStrength = document.getElementById('password-strength');

    passwordStrength.textContent = "🟥";
    // Обработчик ввода пароля
    passwordField.addEventListener('input', function() {
        var password = passwordField.value;
        var strength = calculatePasswordStrength(password);

        // Визуальное представление уровня безопасности пароля
        if (strength >= 60) {
            passwordStrength.textContent = "✅"; //strong
            // passwordStrength.style.color = "green";
        } else if (strength >= 30) {
            passwordStrength.textContent = "🟨"; //medium
            // passwordStrength.style.color = "orange";
        } else {
            passwordStrength.textContent = "🟥"; //weak
            // passwordStrength.style.color = "red";
        }
    });

    // Функция для вычисления уровня безопасности пароля
    function calculatePasswordStrength(password) {
        var length = password.length;
        var hasUppercase = /[A-Z]/.test(password);
        var hasLowercase = /[a-z]/.test(password);
        var hasNumbers = /\d/.test(password);
        var hasSpecialChars = /[!@#$%^&*()_+=-]/.test(password);
    
        // Начальное значение силы пароля
        var strength = 0;
    
        // Проверка длины пароля
        if (length >= 8) {
            strength += 10;
        } else if (length >= 12) {
            strength += 20;
        }
    
        // Проверка наличия букв в разных регистрах
        if (hasUppercase && hasLowercase) {
            strength += 20;
        }
    
        // Проверка наличия цифр
        if (hasNumbers) {
            strength += 15;
        }
    
        // Проверка наличия специальных символов
        if (hasSpecialChars) {
            strength += 15;
        }
    
        // Дополнительные проверки:
        // Вы можете добавить свои собственные критерии оценки безопасности пароля здесь, например, проверку на наличие последовательных символов (12345, qwerty и т. д.).
    
        return strength;
    }

    // Обработчик отправки формы
    // Форма отправится только если пароль безопасен (горит зелёный квадрат)
    var add_user_password_form = document.getElementById('add_user_password_form');
    var passwordField = document.getElementById('password');


    add_user_password_form.addEventListener('submit', function(event) {
        var strength = calculatePasswordStrength(passwordField.value);

        if (strength < 60) {
            event.preventDefault(); // Предотвращение отправки формы
            alert('Пароль недостаточно надежен. Пожалуйста, выберите более надежный пароль.');
        }
    });
});
