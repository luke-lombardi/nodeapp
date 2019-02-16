#!/usr/local/bin/zsh
export TEMPLATE_PATH="./templates/api_template.zip"
export BACKUP_PATH="./templates/api_template.zip.bak"
echo "Updating requirements..."
source venv/bin/activate
python3.6 -m pip install -r requirements.txt

echo "Backing up previous template to: ${BACKUP_PATH}"
cp ${TEMPLATE_PATH} ${BACKUP_PATH}

cd venv/lib/python3.6/site-packages/
echo "Zipping deployment package to: ${TEMPLATE_PATH}"
zip -r9 ../../../../${TEMPLATE_PATH} *