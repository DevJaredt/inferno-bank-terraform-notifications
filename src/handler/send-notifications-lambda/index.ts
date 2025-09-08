// DEBUG Lambda - Para probar si está funcionando
export const handler = async (event: any, context: any) => {
    console.log('🚀 Lambda ejecutándose!');
    console.log('📨 Event recibido:', JSON.stringify(event, null, 2));
    console.log('📋 Context:', JSON.stringify(context, null, 2));
    
    try {
        // Procesar cada record del SQS
        for (const record of event.Records) {
            console.log('📦 Procesando record:', JSON.stringify(record, null, 2));
            
            const messageBody = JSON.parse(record.body);
            console.log('💌 Mensaje parseado:', JSON.stringify(messageBody, null, 2));
            
            console.log(`✅ Mensaje procesado exitosamente: ${messageBody.type}`);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify('Messages processed successfully')
        };
        
    } catch (error) {
        console.error('❌ Error procesando mensaje:', error);
        throw error; // Esto hará que el mensaje vaya al DLQ después de 3 intentos
    }
};