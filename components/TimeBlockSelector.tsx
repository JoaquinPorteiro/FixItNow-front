'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { TimeBlock } from '@/hooks/useTimeBlocks';

interface TimeBlockSelectorProps {
  blocks: TimeBlock[];
  selectedBlock: TimeBlock | null;
  onSelectBlock: (block: TimeBlock) => void;
  isLoading?: boolean;
}

export function TimeBlockSelector({
  blocks,
  selectedBlock,
  onSelectBlock,
  isLoading = false,
}: TimeBlockSelectorProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Bloques de Tiempo Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (blocks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Bloques de Tiempo Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
            <p className="text-yellow-800 font-medium">No hay bloques disponibles</p>
            <p className="text-yellow-700 text-sm mt-2">
              El servicio no está disponible para la fecha seleccionada o no hay horarios libres.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableBlocks = blocks.filter((b) => b.isAvailable);
  const bookedBlocks = blocks.filter((b) => b.isBooked);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Selecciona un Bloque de 1 Hora
        </CardTitle>
        <CardDescription>
          Cada bloque representa una reserva de 1 hora. Selecciona el horario que prefieras.
        </CardDescription>
        <div className="flex gap-2 mt-4">
          <Badge className="bg-green-100 text-green-800">
            {availableBlocks.length} disponibles
          </Badge>
          {bookedBlocks.length > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {bookedBlocks.length} ocupados
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-gray-700">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-700">Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-gray-700">Ocupado</span>
          </div>
        </div>

        {/* Time Blocks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {blocks.map((block) => {
            const isSelected =
              selectedBlock?.startTime === block.startTime &&
              selectedBlock?.endTime === block.endTime;

            return (
              <Button
                key={`${block.startTime}-${block.endTime}`}
                variant={isSelected ? 'default' : 'outline'}
                disabled={!block.isAvailable}
                onClick={() => onSelectBlock(block)}
                className={`
                  h-auto py-4 px-3 flex flex-col items-center justify-center gap-1 transition-all
                  ${
                    isSelected
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-700'
                      : block.isAvailable
                      ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-900'
                      : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <div className="font-bold text-lg">
                  {block.startTime}
                </div>
                <div className="text-xs opacity-75">a</div>
                <div className="font-bold text-lg">
                  {block.endTime}
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 mt-1" />
                )}
                {block.isBooked && (
                  <span className="text-xs mt-1">Ocupado</span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Selected Block Summary */}
        {selectedBlock && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Bloque Seleccionado</span>
            </div>
            <p className="text-green-700">
              Tu reserva será de <span className="font-bold">{selectedBlock.startTime}</span> a{' '}
              <span className="font-bold">{selectedBlock.endTime}</span> (1 hora)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
