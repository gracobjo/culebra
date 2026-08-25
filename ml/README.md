# ML — entorno Python (Kaggle / predicción showroom)

Variables de decisión y datasets: [`docs/Variables_Decision_Datasets_Kaggle.md`](../docs/Variables_Decision_Datasets_Kaggle.md).

## Crear el entorno virtual

En la raíz del repo (`culebra`), con PowerShell:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r ml/requirements.txt
```

Comprobar:

```powershell
python -c "import pandas, sklearn; print('OK', pandas.__version__)"
```

Desactivar: `deactivate`

## Kaggle API

Hay **dos formatos** de credencial:

### A) Token nuevo (empieza por `KG…`) — el tuyo

1. En [Kaggle → Settings → API](https://www.kaggle.com/settings) crea un **API token**.
2. Guarda **solo el token** (una línea) en:

```text
%USERPROFILE%\.kaggle\access_token
```

No uses `kaggle.json` para este token: el CLI lo ignora o falla al parsear.

### B) Formato antiguo (`username` + `key`)

Si Kaggle te descarga un archivo `kaggle.json` con `username` y `key`, colócalo en:

```text
%USERPROFILE%\.kaggle\kaggle.json
```

### Descargar datasets locales

```powershell
.\.venv\Scripts\Activate.ps1
New-Item -ItemType Directory -Force -Path data\kaggle | Out-Null

# P1 tráfico/ticket (ya usado en notebook retail-forecast)
kaggle datasets download -d mmumairkhattak/retail-sales-forecast-dataset-2026 -p data/kaggle/retail-forecast --unzip

# Impulso / market basket
kaggle datasets download -d heeraldedhia/groceries-dataset -p data/kaggle/groceries-mba --unzip
kaggle datasets download -d mittalvasu95/the-bread-basket -p data/kaggle/bread-basket --unzip

# Canal alojamientos
kaggle datasets download -d jessemostipak/hotel-booking-demand -p data/kaggle/hotel-booking --unzip
```

`data/kaggle/` y `.venv/` están en `.gitignore`. Inventario completo: [`docs/Variables_Decision_Datasets_Kaggle.md`](../docs/Variables_Decision_Datasets_Kaggle.md) §3.

## Dataset sintético Culebra

Con el venv activo:

```powershell
python ml/generate_culebra_synthetic.py
```

Salida: `data/synthetic/culebra_showroom_daily.csv` (+ diccionario). Ver mapa de columnas en `docs/Variables_Decision_Datasets_Kaggle.md` §4.

Notebook de análisis (EDA + modelos + gráficos de decisión):

`data/synthetic/culebra_showroom_synthetic_notebook.ipynb`
