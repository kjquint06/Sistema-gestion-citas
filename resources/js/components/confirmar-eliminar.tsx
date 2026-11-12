import { Form } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type Props = {
    titulo: string;
    descripcion: ReactNode;
    accion: Pick<ComponentProps<typeof Form>, 'action' | 'method'>;
    textoBoton?: string;
    textoConfirmar?: string;
    textoCerrar?: string;
};

export default function ConfirmarEliminar({
    titulo,
    descripcion,
    accion,
    textoBoton = 'Eliminar',
    textoConfirmar = 'Eliminar',
    textoCerrar = 'Cancelar',
}: Props) {
    const [abierto, setAbierto] = useState(false);

    return (
        <Dialog open={abierto} onOpenChange={setAbierto}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 size={14} />
                    {textoBoton}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{titulo}</DialogTitle>
                <DialogDescription>{descripcion}</DialogDescription>

                <Form
                    {...accion}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setAbierto(false)}
                    className="space-y-4"
                >
                    {({ processing, errors, resetAndClearErrors }) => (
                        <>
                            <InputError
                                message={errors.eliminar ?? errors.cancelar}
                            />

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => resetAndClearErrors()}
                                    >
                                        {textoCerrar}
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    {textoConfirmar}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
