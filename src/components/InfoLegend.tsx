import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Guide from '@/icons/icono_Pedidos_Guia_.svg'
import Image from 'next/image';

const InfoLegend = () => {
  return (
    <Card className="h-fit sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
            <Image src="/icons/icono_Pedidos_Guia_.svg" alt="Guía" width={20} height={20} />
          Guía de Referencia
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 ">
        <Alert className='bg-gray-200 rounded-none'>
          <AlertDescription >
            <span className="font-semibold">Presentación:</span> <ul>
              <li>Rollo estándar: 100mt</li>
              <li>Bobinita estándar:300mt</li>
              <li>Bobina estándar: 1000mt</li>

            </ul>
            <br />
            <br />
            <p> Atención: La cantidad de metros puede variar según las medidas de sección, ante cualquier duda consulte con nuestros representates.</p>
          </AlertDescription>
        </Alert>

        <Alert className='bg-gray-200 rounded-none'>
          <AlertDescription>
            <span className="font-semibold">Sección:</span> Indica el diámetro o grosor del cable, medido en
            milímetros cuadrados (mm²). Por ejemplo: 1.5mm², 2.5mm², 4mm², etc. <br />
            <br />La sección adecuada debe
            seleccionarse según la corriente que circulará por el cable y la distancia de la instalación.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default InfoLegend;