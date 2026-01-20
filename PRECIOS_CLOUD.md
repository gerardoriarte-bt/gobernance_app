
# 💸 Análisis de Costos de Firebase

Google Cloud (Firebase) tiene un modelo de precios muy generoso para proyectos que están comenzando, llamado **Plan Spark (Gratuito)**.

Para este proyecto ("Governance Builder"), es **altamente probable que sea GRATIS** durante mucho tiempo.

## Lo que es GRATIS (Plan Spark)

| Servicio | Límite Gratuito | ¿Suficiente para nosotros? |
| :--- | :--- | :--- |
| **Authentication** | **Ilimitado** para login con Google/Email. | ✅ Sí. Puedes tener miles de usuarios sin pagar. |
| **Firestore (BD)** | **50,000 lecturas / día**<br>**20,000 escrituras / día**<br>1 GiB de almacenamiento total. | ✅ Sí. Para un equipo de 5-20 personas usando la app diariamente, difícilmente llegarás al 10% de este límite. |
| **Hosting** | 10 GB de transferencia / mes. | ✅ Sí, aunque nosotros usaremos tu EC2 para el hosting, así que esto no aplica. |

---

## ¿Cuándo tendrías que pagar? (Escalabilidad)

Solo si tu aplicación crece masivamente (ej. cientos de usuarios usándola intensamente todo el día), pasarías los límites gratuitos.

1.  **Si pasas de 50k lecturas al día**: Tendrías que cambiar al **Plan Blaze** (Pago por uso).
    *   Costo: $0.06 USD por cada 100,000 lecturas adicionales.
    *   Es extremadamente barato incluso si te pasas un poco.
2.  **Si almacenas más de 1 GB de datos**:
    *   Costo: $0.18 USD por GB/mes.
    *   Nuestras taxonomías son texto ligero (JSON), podríais guardar millones de registros antes de llegar a 1 GB.

## Conclusión

El uso de **Google Cloud Firestore + Authentication** para este proyecto **NO TE COSTARÁ DOLAR** inicialmente y probablemente se mantenga gratis por mucho tiempo dado el caso de uso interno (B2B).

El único costo fijo que tienes ahora es tu servidor **AWS EC2 t3.micro** (que son aprox. $8-10 USD/mes si no tienes capa gratuita de AWS).
