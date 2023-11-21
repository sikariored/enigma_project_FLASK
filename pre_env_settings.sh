#!/bin/zsh

export FLASK_APP=app
export FLASK_ENV=development

# Проверка на соответствие глобальных переменных
if [ "$FLASK_APP" == "app" ]
then
    echo -e "FLASK_APP \t::: $FLASK_APP :::\t\t[OK]"
else
	echo -e "FLASK_APP \t::: $FLASK_APP :::\t\t[ERROR]"
fi

if [ "$FLASK_ENV" == "development" ]
then
    echo -e "FLASK_ENV \t::: $FLASK_ENV :::\t[OK]"
else
	echo -e "FLASK_ENV \t::: $FLASK_ENV :::\t[ERROR]"
fi
