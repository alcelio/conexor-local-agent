# 📁 Assets - Ícones do Instalador

Esta pasta contém os ícones necessários para os instaladores do Conexor Local Agent.

## 🎨 Ícones Necessários:

### **Windows**
- `icon.ico` - Ícone do instalador e aplicação (256x256, .ico format)

### **macOS**
- `icon.icns` - Ícone do instalador (.icns format, múltiplas resoluções)

### **Linux**
- `icon.png` - Ícone da aplicação (512x512, .png format)

## ⚠️ Status Atual:

**PENDENTE:** Ícones ainda não foram criados.

## 📝 Como Criar os Ícones:

### **Opção 1: Usar ferramentas online (gratuito)**
1. Criar ícone base em 512x512 (pode usar Canva, Figma, ou ícone genérico de impressora)
2. Converter para formatos necessários:
   - **ICO:** https://convertio.co/png-ico/
   - **ICNS:** https://iconverticons.com/online/

### **Opção 2: Usar ícone genérico temporário**
Por enquanto, o build vai falhar sem os ícones. Para testar, você pode:
- Baixar um ícone genérico de impressora
- Converter para os 3 formatos
- Colocar nesta pasta

### **Opção 3: Fazer o build sem ícones (não recomendado)**
Remover as linhas de `icon` do `package.json` → `build` section.

---

**🚀 Pensado por: Alcélio Gomes - Conexor**
