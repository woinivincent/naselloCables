import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InfoLegend = () => {
    return (
      <Card className="h-fit sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-primary" />
            Guía de Referencia
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert>
            <AlertDescription>
              <span className="font-semibold">Presentación:</span> <ul>
                <li>Rollo Estandar</li>
                <li>Bobina </li>
                <li>Bobinita </li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertDescription>
              <span className="font-semibold">Sección:</span> Indica el diámetro o grosor del cable, medido en 
              milímetros cuadrados (mm²). Por ejemplo: 1.5mm², 2.5mm², 4mm², etc. La sección adecuada debe 
              seleccionarse según la corriente que circulará por el cable y la distancia de la instalación.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  };
  
  export default InfoLegend;