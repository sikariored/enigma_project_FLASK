document.addEventListener("DOMContentLoaded", function () {

  //Объявление глобальных переменных
  const userSearch = document.getElementById("userSearch");
  const userDetails = document.querySelectorAll("details");
  const userResources = document.getElementById("userResources");
  const userResourceInfo = document.getElementById("userResourceInfo");
  let activeRequest = null;
  let selectedUser = null;

  //Поиск по пользователям
  userSearch.addEventListener("input", function () {
    const searchValue = userSearch.value.toLowerCase();
    let openDetails = false;

    userDetails.forEach(function (detail) {
      const users = detail.querySelector("ul");
      const userItems = users.querySelectorAll("li");
      let openDetail = false;

      userItems.forEach(function (user) {
        const userName = user.textContent.toLowerCase();

        if (userName.includes(searchValue)) {
          openDetail = true;
          user.style.display = "list-item";
        } else {
          user.style.display = "none";
        }
      });

      if (openDetail) {
        detail.setAttribute("open", "open");
        users.style.display = "block";
        openDetails = true;
      } else {
        detail.removeAttribute("open");
        users.style.display = "none";
      }
    });

    if (searchValue === "") {
      userDetails.forEach(function (detail) {
        detail.removeAttribute("open");
      });
    }

    if (!openDetails && searchValue !== "") {
      userDetails[0].setAttribute("open", "open");
    }
  });

  //Функция загрузки ресурсов пользователя
  function loadUserResources(userName) {
    $.ajax({
      url: `/get_user_resources?username=${userName}`,
      type: "GET",
      dataType: "json",
      success: function (data) {
        const userResourcesList = document.getElementById("userResourcesList");
        
        while (userResourcesList.firstChild) {
          userResourcesList.removeChild(userResourcesList.firstChild);
        }

        data.resources.forEach(function (resource) {
          const listItem = document.createElement("li");
          listItem.textContent = resource;
          userResourcesList.appendChild(listItem);
        });
      },
      error: function (error) {
        console.error(error);
        userResources.innerHTML = "Ошибка при запросе данных";
      },
    });
  }

  userDetails.forEach(function (detail) {
    const users = detail.querySelector("ul");
    const userItems = users.querySelectorAll("li");
//Клик по пользователю и вывод его ресурсов через функцию загрузки рес-ов
    userItems.forEach(function (user) {
      user.addEventListener("click", function () {

        // Очищаем старое выделение пользователя
        const selectedUsers = document.querySelectorAll(".selected-user");
        selectedUsers.forEach(function (user) {
          user.classList.remove("selected-user");
        });

        userItems.forEach(u => u.classList.remove("selected-user"));
        user.classList.add("selected-user");
        selectedUser = user;

        const userName = user.textContent;
        loadUserResources(userName);
      });
    });
  });
  
  async function getUserResourceInfo(resourceText, userName) {
    return new Promise((resolve, reject) => {
      activeRequest = $.ajax({
        url: `/get_user_resource_info?userresource=${resourceText}&username=${userName}`,
        type: "GET",
        dataType: "json",
        success: function (data) {
          resolve(data);
        },
        error: function (error) {
          console.error(error);
          reject(error);
        },
      });
    });
  }

//Клик по ресурсу и вывод инфы по нему
  userResources.addEventListener("click", async function (event) {
    if (activeRequest) {
      activeRequest.abort();
    }

    const resourceText = event.target.textContent;
    const userName = selectedUser.textContent;

    // Очищаем старое выделение ресурса
    const selectedResources = document.querySelectorAll(".selected-resource");
    selectedResources.forEach(function (resource) {
      resource.classList.remove("selected-resource");
    });

    try {
      const data = await getUserResourceInfo(resourceText, userName);

      const userPasswordFieldWrapper = document.getElementById("userPasswordFieldWrapper");
      const userLoginFieldWrapper = document.getElementById("userLoginFieldWrapper");

      userResourceInfo.style.display = "flex";
      
      const existingUserLoginField = document.getElementById("userLoginFieldId");
      const existingUserPasswordField = document.getElementById("userPasswordFieldId");
      const existingUserWhoCreateField = document.getElementById("userWhoCreateId");
      const existingUserWhereCreateField = document.getElementById("userWhereCreateId");

      // Добавляем класс к выбранному ресурсу для подсветки
      event.target.classList.add("selected-resource");
      
      //Удаление информации о предыдущем выбранном пользователе при наличии таковой в правой части экрана
      if (existingUserLoginField && existingUserPasswordField && existingUserWhoCreateField && existingUserWhereCreateField) {
        existingUserLoginField.remove();
        existingUserPasswordField.remove();
        existingUserWhoCreateField.remove();
        existingUserWhereCreateField.remove();
      }

      //Вывод логина
      const userLoginField = document.createElement("input");
      userLoginField.type = "text";
      userLoginField.readOnly = true;
      userLoginField.id = "userLoginFieldId";
      userLoginField.className = "userSecurityData";
      userLoginField.value = data.userlogin;
      userLoginFieldWrapper.appendChild(userLoginField);
      //Вывод пароля
      const userPasswordField = document.createElement("input");
      userPasswordField.type = "password";
      userPasswordField.readOnly = true;
      userPasswordField.id = "userPasswordFieldId";
      userPasswordField.className = "userSecurityData";
      userPasswordField.value = data.userpassword;
      userPasswordFieldWrapper.appendChild(userPasswordField);
      //Вывод создателя доступа
      const userWhoCreate = document.createElement("p");
      userWhoCreate.id = "userWhoCreateId";
      userWhoCreate.innerHTML = data.whocreate;
      document.getElementById("userCreateInfoWrapper").appendChild(userWhoCreate);
      //Вывод времени создания
      const userWhereCreate = document.createElement("p");
      userWhereCreate.id = "userWhereCreateId";
      userWhereCreate.innerHTML = data.created;
      document.getElementById("userCreateInfoWrapper").appendChild(userWhereCreate);
    
    } catch (error) {
      console.error(error);
    }
  });


  //Кнопка видимости пароля
  const showPasswordButton = document.getElementById('show-password-button');

  showPasswordButton.addEventListener('click', function() {

    if (userPasswordField.type == "password") {
      userPasswordField.type = "text";
      showPasswordButton.style = "background-color: red";
    } else {
      userPasswordField.type = "password";
      showPasswordButton.style = "background-color: aquamarine";
    }
  });

  //Кнопка копирования логина

  $("#copyLoginButton").click(async () => { 
    try {
      await navigator.clipboard.writeText(document.getElementById("userLoginFieldId").value);
    }    catch (err) {
      console.error("Failed to copy!");
    }
  });

  //Кнопка копирования пароля

  $("#copyPasswordButton").click(async () => { 
    try {
      await navigator.clipboard.writeText(document.getElementById("userPasswordFieldId").value);
    }    catch (err) {
      console.error("Failed to copy!");
    }
  });

});
