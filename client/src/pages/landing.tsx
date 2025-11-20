import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, QrCode, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-4" data-testid="text-title">
            Система управления паспортами
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Безопасное хранение и управление документами с автоматическим контролем сроков действия
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Войти в систему
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-base">Безопасность</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Защищенное хранение данных с контролем доступа
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 pb-2">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-base">Группы</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Организация паспортов по группам для удобного управления
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 pb-2">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-base">QR-коды</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Публичные страницы с QR-кодами для каждого паспорта
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 pb-2">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-base">Автоматизация</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Автоматическая проверка сроков действия и уведомления
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
