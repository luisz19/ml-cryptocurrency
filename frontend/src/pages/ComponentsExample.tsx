import {
  Button,
  buttonVariants,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  ThemeToggle,
} from "@/components";

const ComponentsExample = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Exemplo de Componentes</h1>
        <ThemeToggle />
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button>Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <a className={buttonVariants({ variant: "link" })}>Link</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Card Padrão</CardTitle>
            <CardDescription>Usa bg-card e border variables.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Seu nome" />
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Opção 1</SelectItem>
                <SelectItem value="2">Opção 2</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter>
            <Button>Salvar</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabela</CardTitle>
            <CardDescription>Visual para dark e light.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>BTC</TableCell>
                  <TableCell>Ativo</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ETH</TableCell>
                  <TableCell>Ativo</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComponentsExample;
