import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import random

app = Flask(__name__)
app.secret_key = 'eZWptbf~lpWObfD1VndrYqvL!'

# #RANDOM_FILL_START
# def random_fill():
#     # Подключитесь к базе данных
#     conn = sqlite3.connect('database.db')
#     cursor = conn.cursor()

#     # Определите отделы и выполните вставку
#     departments = [
#         ("Производство",),
#         ("Продажи",),
#         ("Маркетинг",),
#         ("Финансы",),
#         ("Логистика",),
#         ("Инжиниринг",),
#         ("Сервис",),
#         ("Информационные технологии",),
#         ("Кадры",),
#         ("Бухгалтерия",),
#         ("Юридический отдел",),
#         ("Реклама",)
#     ]

#     cursor.executemany('INSERT OR IGNORE INTO departments (departname) VALUES (?)', departments)
#     conn.commit()
#     conn.close()

#     conn = sqlite3.connect('database.db')
#     cursor = conn.cursor()

#     # Определите роли и выполните вставку
#     roles = [
#         ("Замерщик",),
#         ("Бухгалтер",),
#         ("Монтажник",),
#         ("Офис-менеджер",),
#         ("Секретарь",)
#     ]

#     cursor.executemany('INSERT INTO roles (rolename) VALUES (?)', roles)
#     conn.commit()
#     conn.close()

#     conn = sqlite3.connect('database.db')
#     cursor = conn.cursor()

#     # Определите данные о пользователях и выполните вставку
#     accounts = []
#     for _ in range(100):
#         username = "User" + str(random.randint(1, 1000))
#         userlogin = f"user_{random.randint(100, 999)}@example.com"
#         userpassword = random.randint(18, 60)
#         userrole = random.choice([r[0] for r in roles])
#         userdepart = random.choice([d[0] for d in departments])
#         userresource = random.choice([
#             "Google", "Facebook", "Twitter", "YouTube", "LinkedIn",
#             "Instagram", "Reddit", "Pinterest", "Wikipedia", "Amazon",
#             "Netflix", "Spotify", "GitHub", "Stack Overflow", "Medium",
#             "Quora", "Twitch", "Dropbox", "Slack", "Etsy"
#         ])
#         whocreate = userrole  # Здесь вы можете уточнить, какое поле используется

#         accounts.append((username, userlogin, userpassword, userrole, userdepart, userresource, whocreate))

#     cursor.executemany('INSERT INTO accounts (username, userlogin, userpassword, userrole, userdepart, userresource, whocreate) VALUES (?, ?, ?, ?, ?, ?, ?)', accounts)
#     conn.commit()
#     conn.close()
#random_fill()
# #RANDOM_FILL_END


# Добавьте путь к папке 'profiles' в настройку шаблонов
app.template_folder = 'templates'
app.config['TEMPLATES_AUTO_RELOAD'] = True

#ДОСТУП РОЛЕЙ К РОЛЯМ
available_roles = {
            'IT Администратор' : ['IT Администратор', 'Веб-разработчик', 'IT Специалист'], 
            'ОКК Администратор': [
                                    'МОП Окна',
                                    'МОП Потолки/Ремонт',
                                    'МОП Дизайн',
                                    'Дизайнер',
                                    'Прораб',
                                    'Монтажник окна',
                                    'ОТК',
                                    'ОКК',
                                    'Зам руководителя',
                                    'Разрабочки',
                                    'СЕО',
                                    'СММ',
                                    'Руководитель ГРС',
                                    'Менеджер ГРС',
                                    'Рекламаторщик',
                                    'Замерщик',
                                    'Водитель Окна',
                                    'Водитель Материалы',
                                    'Офис менеджер',
                                    'Бухгалтер',
                                    '?ИНОЕ?'
                                    ],     
            'Администратор портала' : [],
        }
#ДОСТУП РОЛЕЙ К ОТДЕЛАМ
available_departments = {
            'IT Администратор' : ['IT Отдел'],
            'ОКК Администратор' : ['IT Отдел',
                                'Отдел контроля качества',
                                'SEO отдел',
                                'Производство',
                                'Продажи',
                                'Маркетинг',
                                'Логистика',
                                'Сервис',
                                'Кадры',
                                'Бухгалтерия',
                                'Юридический отдел'],
            'Администратор портала' : [],
}

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

#Запрос ВСЕЙ информации по ВСЕМ аккаунтам
def get_all_accounts():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT userid, created, userlogin, username, userpassword, userrole, userdepart, userresource, whocreate FROM accounts')
    accounts = cursor.fetchall()
    conn.close()
    return accounts

#Запрос акканутов для Админа ОКК
def get_accounts_for_okk_admin():
    conn = get_db_connection()
    cursor = conn.cursor()
    departments = ("Отдел продаж", "Отдел контроля качества")
    cursor.execute(f'SELECT userid, created, userlogin, username, userpassword, userrole, userdepart, userresource, whocreate FROM accounts WHERE userdepart IN {departments}')
    accounts = cursor.fetchall()
    conn.close()
    return accounts

# Загрузка РОЛЕЙ из базы данных
def get_roles():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Получите роль пользователя из сессии
    user_role = session.get('userrole')

    if user_role == 'Администратор портала':
        cursor.execute('SELECT rolename FROM roles')
        roles = [row[0] for row in cursor.fetchall()]
        conn.close()
        return roles

    # Получите доступные роли для данной роли пользователя
    available = available_roles.get(user_role, [])
    if available is None:
        available = []

    # Используйте параметры для передачи в SQL-запрос
    cursor.execute('SELECT rolename FROM roles WHERE rolename IN ({})'.format(','.join(['?'] * len(available))), tuple(available))

    # Получите роли, которые доступны для текущего пользователя
    roles = [role[0] for role in cursor.fetchall()]

    conn.close()
    return roles

# Загрузка ОТДЕЛОВ из базы данных
def get_departments():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Получите роль пользователя из сессии
    user_role = session.get('userrole')

    if user_role == 'Администратор портала':
        cursor.execute('SELECT departname FROM departments')
        departments = [row[0] for row in cursor.fetchall()]
        conn.close()
        return departments

    # Получите доступные отделы для данной роли пользователя
    available = available_departments.get(user_role, [])
    if available is None:
        available = []

    # Используйте параметры для передачи в SQL-запрос
    cursor.execute('SELECT departname FROM departments WHERE departname IN ({})'.format(','.join(['?'] * len(available))), tuple(available))

    # Получите роли, которые доступны для текущего пользователя
    departments = [depart[0] for depart in cursor.fetchall()]

    conn.close()
    return departments


@app.route('/')
def index():
    return redirect(url_for('profile'))

@app.route('/info')
def info():
    return render_template('info.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        userlogin = request.form['userlogin']
        password = request.form['password']

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT userlogin, username, userpassword, userrole, userdepart FROM accounts WHERE userlogin=?', (userlogin,))
        userdata = cursor.fetchone()
        conn.close()

        if userdata and userdata['userpassword'] == password:
            session['username'] = userdata['username']
            session['userrole'] = userdata['userrole']
            session['userdepart'] = userdata['userdepart']
            return redirect(url_for('profile'))
        else:
            flash('Неверный логин или пароль', 'danger')


    return render_template('login.html')

@app.route('/add_user_password', methods=['POST'])
def add_user_password():
    if request.method == 'POST':
        username = request.form['username']
        userlogin = request.form['userlogin']
        password = request.form['password']
        userrole = request.form['userrole']
        userresource = request.form['userresource']
        # userdepart = request.form['userdepart']

        if not username:
            return "Не выбрано имя пользователя"

        conn = get_db_connection()
        cursor = conn.cursor()

        whocreate = session['userrole'] + " " + session['username']

        try:
            cursor.execute('INSERT INTO accounts (username, userlogin, userpassword, userrole, userresource, whocreate) VALUES (?, ?, ?, ?, ?, ?)', (username, userlogin, password, userrole, userresource, whocreate))
            conn.commit()
            conn.close()
            flash('Пользователь успешно добавлен.', 'success')
        except Exception as e:
            conn.close()
            flash(f"Error: {str(e)}", 'danger')

        return redirect(url_for('profile'))
    




@app.route('/get_suggestions', methods=['GET'])
def get_suggestions():
    conn = get_db_connection()
    cursor = conn.cursor()

    username_prefix = request.args.get('q', '')
    cursor.execute("SELECT DISTINCT username FROM accounts WHERE username LIKE ? LIMIT 10", (username_prefix + '%',))
    suggestions = [row[0] for row in cursor.fetchall()]

    conn.close()

    return jsonify(results=[{'id': username, 'text': username} for username in suggestions])


# NEW


# Создайте функцию для получения отделов и пользователей
def get_users_from_departments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT userdepart, username, userrole FROM accounts')
    data = cursor.fetchall()
    conn.close()

    # Создайте словарь для хранения уникальных пользователей по отделам
    department_users = {}

    for row in data:
        department = row['userdepart']
        username = row['username']
        userrole = row['userrole']

        # Если отдел уже существует, добавьте пользователя только если его нет в списке
        if department in department_users:
            users = department_users[department]
            user_with_role = f"{username} | {userrole}"

            if user_with_role not in users:
                users.append(user_with_role)
        else:
            # Если отдел не существует, создайте новую запись
            department_users[department] = [f"{username} | {userrole}"]

    return department_users


@app.route('/get_user_resources')
def get_user_resources():
    username_with_role = request.args.get('username')
    username = username_with_role.split('|')[0].strip()

    # Выполните SQL-запрос для получения ресурсов пользователя на основе имени (username)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT userresource FROM accounts WHERE username = ?', (username,))
    resources = [row[0] for row in cursor.fetchall()]
    conn.close()

    # Отправьте список ресурсов в формате JSON
    return jsonify(resources=resources)

@app.route('/get_user_resource_info')
def get_user_resource_info():
    userresource = request.args.get('userresource')
    username_with_role = request.args.get('username')
    username = username_with_role.split('|')[0].strip()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT userlogin, userpassword, whocreate, created FROM accounts WHERE username = ? AND userresource = ?', (username, userresource))
    row = cursor.fetchone()
    if row:
        userlogin, userpassword, whocreate, created = row  # Распаковываем значения в отдельные переменные
        return jsonify(userlogin=userlogin, userpassword=userpassword, whocreate=whocreate, created=created)
    else:
        return jsonify(error="Записи не найдены")

@app.route('/profile')
def profile():
    if 'username' in session:
        username = session['username']
        userrole = session['userrole']
        userdepart = session['userdepart']

        if 'userrole' in session:
            userrole = session['userrole']
            if userrole == 'IT Администратор':
                roles = get_roles()
                accounts = get_all_accounts()
                departments = get_departments()
                return render_template('profiles/it_admin_profile.html', username=username, userrole=userrole, userdepart=userdepart, roles=roles, departments=departments, accounts=accounts)
            elif userrole == 'ОКК Администратор':
                accounts = get_all_accounts()
                departments = get_departments()
                roles = get_roles()
                return render_template('profiles/it_admin_profile.html', username=username, userrole=userrole, roles=roles, departments=departments, accounts=accounts)
            elif userrole == 'SEO Администратор':
                return render_template('profiles/seo_admin_profile.html', username=username, userrole=userrole, roles=roles, departments=departments)
            elif userrole == 'Менеджер':
                return render_template('profiles/manager_profile.html', username=username, userrole=userrole, roles=roles, departments=departments)
            elif userrole == 'Веб-разработчик':
                return render_template('profiles/web_dev_profile.html', username=username, userrole=userrole, roles=roles, departments=departments)
            elif userrole == 'SEO специалист':
                return render_template('profiles/seo_spec_profile.html', username=username, userrole=userrole, roles=roles, departments=departments)
            elif userrole == 'Администратор портала':
                departments = get_departments()
                users_from_departments = get_users_from_departments()
                return render_template('profiles/admin_profile.html', username=username, userrole=userrole, departments=departments, users_from_departments=users_from_departments)
            else:
                return redirect(url_for('login'))
    else:
        return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)