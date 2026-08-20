# assetlinks.json — pendiente de completar

Este archivo (`public/.well-known/assetlinks.json`) ahora mismo tiene
valores de relleno (`PENDIENTE_...`). Hace falta para que la app de Android
se abra a pantalla completa, sin la barra de direcciones de Chrome — sin
esto, Android no confía en que la web y la app sean del mismo dueño.

## Cuándo rellenarlo

Después de generar la app con Bubblewrap (`bubblewrap init` apuntando a tu
URL de producción), la herramienta crea un certificado de firma y te da:

- El **nombre de paquete** que elijas (ej. `com.minichef.app`).
- La **huella SHA-256** del certificado (Bubblewrap te la imprime en pantalla,
  o puedes sacarla con `keytool -list -v -keystore android.keystore`).

## Qué hacer con esos dos datos

Sustituye en este archivo:
- `"package_name"` → tu nombre de paquete real.
- `"sha256_cert_fingerprints"` → la huella real (con los dos puntos, tal cual
  te la da la herramienta, ej. `14:6D:E9:83:C5:73...`).

Luego vuelve a desplegar la web (este archivo tiene que ser accesible en
`https://tu-dominio/.well-known/assetlinks.json`) y verifícalo con la
herramienta oficial de Google:
https://developers.google.com/digital-asset-links/tools/generator

**Importante:** si usas Play App Signing (recomendado, y probablemente
obligatorio para apps nuevas), la huella real que hay que poner es la del
certificado que **Google** usa para firmar la app en la Play Store, no la de
tu certificado de subida — se consulta en Play Console → configuración de la
app → integridad de la app → Firma de la app.
