# 🚀 Sui NFT Mint dApp

Este projeto é um **MVP** de um dApp para **mintar NFTs na blockchain Sui**, usando:

- [Sui Move](https://docs.sui.io) para o contrato (`contract/`)
- [Next.js 13+ App Router](https://nextjs.org/docs/app) + [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit/) no frontend (`app/`)

---

## 📦 Pré-requisitos

- **Node.js** v18+
- **pnpm / npm / yarn**
- **Sui CLI** instalado e configurado ([docs](https://docs.sui.io/guides/developer/getting-started/sui-install))

Verifique:
```bash
sui --version
```

---

## 🛠️ Instalação

Clone o repositório e instale dependências:

```bash
git clone https://github.com/SEU_USUARIO/mint-nft-sui.git
cd mint-nft-sui
npm install
```

---

## ⚡ Contrato (Move)

1. Entre na pasta do contrato:
   ```bash
   cd contract
   ```

2. Publique na rede desejada (exemplo: `devnet`):
   ```bash
   sui client publish --gas-budget 100000000
   ```

3. Copie o `Package ID` exibido no terminal — ele será usado no frontend.

---

## 💻 Frontend (Next.js + dApp Kit)

1. Volte para a pasta raiz:
   ```bash
   cd ..
   ```

2. Rode o app:
   ```bash
   npm run dev
   ```

3. Abra em [http://localhost:3000](http://localhost:3000)

---

## 🚀 Como usar

1. Conecte sua carteira Sui (botão **Connect** no header).  
2. Escolha a rede (**devnet / testnet / mainnet**).  
3. Insira:
   - **Package ID** (do contrato publicado)  
   - **Nome**, **Descrição** e **URL da imagem (< 1MB)**  
4. Valide o Package e a Imagem.  
5. Clique em **Mintar NFT** 🎉  

Após mintar:
- Veja a transação direto no **SuiScan**  
- Gere outro NFT  
- Acompanhe o **histórico da sessão** com as NFTs criadas

---

## 📝 Notas

- O contrato é um NFT básico para fins de demonstração.
- O frontend usa `@mysten/dapp-kit`, stack oficial moderna da Sui.
- Histórico de NFTs é armazenado apenas em memória (sessão do navegador).
