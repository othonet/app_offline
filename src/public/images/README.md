# Pasta de Imagens

Esta pasta contém as imagens estáticas do sistema.

## Imagem de Fundo do Login

Para adicionar uma imagem de fundo personalizada na página de login:

1. Adicione sua imagem nesta pasta (ex: `login-bg.jpg`)
2. Edite o arquivo `src/views/layouts/auth.hbs`
3. Na linha 33, substitua o `style` atual por:
   ```html
   <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-10" style="background-image: url('/images/login-bg.jpg');"></div>
   ```

### Recomendações:
- **Formato**: JPG ou PNG
- **Tamanho**: Recomendado 1920x1080px ou maior
- **Peso**: Otimize a imagem para web (máximo 500KB)
- **Conteúdo**: Use imagens que não interfiram na legibilidade do texto

