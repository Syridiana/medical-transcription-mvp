'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: () => void;
}

export function ConsentModal({ isOpen, onClose, onConsent }: ConsentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-violet-200">
        <DialogHeader>
          <DialogTitle className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
            Autorización de Grabación de Audio
          </DialogTitle>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>
              Para proceder con la grabación de audio, necesitamos su autorización explícita.
            </p>
            <p>
              Al hacer clic en &ldquo;Acepto&rdquo;, usted confirma que:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Está de acuerdo con la grabación de audio de la consulta médica.</li>
              <li>Entiende que el audio será procesado para generar una transcripción.</li>
              <li>La información será tratada con confidencialidad y siguiendo protocolos de seguridad.</li>
            </ul>
            <p>
              Puede detener la grabación en cualquier momento.
            </p>
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline"
            onClick={onClose}
            className="cursor-pointer border-violet-200 hover:bg-violet-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConsent();
              onClose();
            }}
            className="cursor-pointer bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            Acepto y autorizo la grabación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 