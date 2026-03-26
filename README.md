# 📦 InvenPro - Sistema de Inventario y Ventas

Sistema web completo para gestión de inventario y ventas con Firebase.

## Estructura

```
invenpro/
├── index.html          # Login
├── dashboard.html      # Panel principal
├── subir.html          # Subir productos
├── ventas.html         # Ventas
├── historial.html      # Control de ventas
├── cuenta.html         # Mi cuenta
├── css/
│   └── styles.css      # Estilos
└── js/
    ├── firebase.js     # Configuración Firebase
    ├── auth.js         # Autenticación
    ├── app.js          # Utilidades
    ├── productos.js    # Módulo productos
    └── ventas.js       # Módulo ventas
```

## Configuración

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password + Google)
3. Habilita Firestore Database (modo test)
4. Edita `js/firebase.js` con tus credenciales

## Despliegue

Sube todos los archivos a GitHub Pages, Netlify, Vercel, o cualquier hosting estático.
