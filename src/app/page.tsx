"use client";

import { useState } from "react";
import {
  ConnectButton,
  useSuiClient,
  useSuiClientContext,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

// Componente de logo simples em SVG
function SuiTrainingLogo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width="28" height="28" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#00B0FF" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="url(#g)" />
        <path d="M24 11c6 8 9 12 9 16a9 9 0 1 1-18 0c0-4 3-8 9-16Z" fill="#fff" />
      </svg>
      <div className="leading-5">
        <div className="font-semibold tracking-tight text-[#323232]">Sui Modules</div>
        <div className="text-xs text-gray-500 -mt-0.5">Treinamento • NFT Mint</div>
      </div>
    </div>
  );
}

// Gerar o tx pro usuário poder visualizar a nft no explorer
function explorerTxLink(net: string, digest: string) {
  return net === "mainnet"
    ? `https://suiscan.xyz/tx/${digest}`
    : `https://suiscan.xyz/${net}/tx/${digest}`;
}

export default function Page() {
  // Hooks do Sui dApp Kit
  const client = useSuiClient();
  const { networks, network, selectNetwork } = useSuiClientContext(); // contexto de rede ativa
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction(); // assinar + enviar tx

  // Estados principais do formulário e fluxo
  const [packageId, setPackageId] = useState("");
  const [pkgOk, setPkgOk] = useState(false);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  // Estados de loading e feedback
  const [busyPkg, setBusyPkg] = useState(false);
  const [busyImg, setBusyImg] = useState(false);
  const [minting, setMinting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Última transação e histórico local
  const [lastDigest, setLastDigest] = useState<string | null>(null);
  const [history, setHistory] = useState<
    Array<{ digest: string; name: string; desc: string; img: string; when: number }>
  >([]);

  // Validação do packageId: tenta carregar módulos Move do pacote
  const validatePackage = async () => {
    setBusyPkg(true);
    setStatus(null);
    setPkgOk(false);
    try {
      await client.getNormalizedMoveModulesByPackage({ package: packageId });
      setPkgOk(true);
      setStatus("Package válido ✅");
    } catch (e) {
      console.error(e);
      setStatus("Package inválido ou não encontrado nesta rede ❌");
    } finally {
      setBusyPkg(false);
    }
  };

  // Validação da imagem: checa tamanho via HEAD/content-length e blob
  const validateImage = async () => {
    setBusyImg(true);
    setStatus(null);
    setImgPreview(null);
    try {
      const head = await fetch(imgUrl, { method: "HEAD" });
      const len = head.ok ? head.headers.get("content-length") : null;
      if (len && Number(len) > 1024 * 1024) {
        setStatus("A imagem deve ter menos de 1MB.");
        setBusyImg(false);
        return;
      }
      const res = await fetch(imgUrl);
      if (!res.ok) throw new Error("Falha ao baixar imagem");
      const blob = await res.blob();
      if (blob.size > 1024 * 1024) {
        setStatus("A imagem deve ter menos de 1MB.");
        setBusyImg(false);
        return;
      }
      setImgPreview(imgUrl);
      setStatus("Imagem válida ✅");
    } catch (e) {
      console.error(e);
      setStatus("URL inválida ou bloqueada por CORS ❌");
    } finally {
      setBusyImg(false);
    }
  };

  // Condição para habilitar botão Mint
  const canMint = pkgOk && !!name.trim() && !!desc.trim() && !!imgPreview && !minting;

  // Resetar formulário após criar NFT
  const resetForm = () => {
    setName("");
    setDesc("");
    setImgUrl("");
    setImgPreview(null);
    setStatus(null);
  };

  // Execução da transação de mint
  const onMint = async () => {
    if (!canMint) return;
    // Monta TransactionBlock com moveCall no módulo nft::mint
    setMinting(true);
    // Assina e envia via carteira conectada
    setStatus(null);
    // Atualiza histórico local com digest retornado
    setLastDigest(null);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::nft::mint`,
        arguments: [
          tx.pure.string(name.trim()),
          tx.pure.string(desc.trim()),
          tx.pure.string(imgUrl.trim()),
        ],
      });

      const { digest } = await signAndExecuteTransaction({ transaction: tx });
      setLastDigest(digest);
      setHistory((h) => [
        { digest, name: name.trim(), desc: desc.trim(), img: imgUrl.trim(), when: Date.now() },
        ...h,
      ]);
      setStatus("NFT mintado ✅");
    } catch (e) {
      console.error(e);
      setStatus("Falha no mint. Verifique saldo de gas, package e parâmetros.");
    } finally {
      setMinting(false);
    }
  };

  const txUrl = lastDigest ? explorerTxLink(network, lastDigest) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 gap-6">
      {/* HEADER */}
      <header className="flex w-full max-w-4xl items-center justify-between">
        <SuiTrainingLogo />
        <div className="flex items-center gap-3">
          <select
            className="border rounded p-2 bg-white text-[#323232]"
            value={network}
            onChange={(e) => selectNetwork(e.target.value)}
          >
            {Object.keys(networks).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <ConnectButton />
        </div>
      </header>

      {/* MAIN */}
      <main className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow space-y-5">
        <div className="flex gap-2">
          <input
            className="border w-full p-2 rounded text-[#323232] placeholder:text-gray-600"
            placeholder="Cole aqui o Package ID publicado"
            value={packageId}
            onChange={(e) => {
              setPackageId(e.target.value.trim());
              setPkgOk(false);
            }}
          />
          <button
            className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50"
            onClick={validatePackage}
            disabled={!packageId || busyPkg}
          >
            {busyPkg ? "Validando..." : "Validar"}
          </button>
        </div>
        {pkgOk && <p className="text-green-600 text-sm">Package válido ✅</p>}

        <input
          className="border w-full p-2 rounded text-[#323232] placeholder:text-gray-600"
          placeholder="Nome do NFT"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="border w-full p-2 rounded text-[#323232] placeholder:text-gray-600"
          placeholder="Descrição do NFT"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <input
            className="border w-full p-2 rounded text-[#323232] placeholder:text-gray-600"
            placeholder="URL da imagem (≤ 1MB)"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
          />
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={validateImage}
            disabled={!imgUrl || busyImg}
          >
            {busyImg ? "Checando..." : "Validar"}
          </button>
        </div>

        {imgPreview && (
          <img src={imgPreview} alt="preview" className="w-32 h-32 object-cover rounded border" />
        )}

        <button
          className="w-full py-3 rounded bg-green-600 text-white disabled:opacity-50"
          onClick={onMint}
          disabled={!canMint}
        >
          {minting ? "Mintando..." : "Mintar NFT"}
        </button>

        {/* Ações após mint */}
        {lastDigest && (
          <div className="flex gap-3">
            <a
              href={txUrl!}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded bg-gray-800 text-white"
            >
              Verificar NFT
            </a>
            <button
              onClick={resetForm}
              className="px-4 py-2 rounded bg-gray-200 text-[#323232]"
            >
              Gerar NFT novo
            </button>
          </div>
        )}

        {status && <div className="text-sm text-gray-700">{status}</div>}
      </main>

      {/* Histórico de mints */}
      {history.length > 0 && (
        <section className="w-full max-w-4xl">
          <h3 className="text-[#323232] font-semibold mb-2">NFTs criadas nesta sessão</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {history.map((h) => (
              <div
                key={h.digest}
                className="bg-white p-4 rounded-xl shadow border flex gap-3"
              >
                <img
                  src={h.img}
                  alt="thumb"
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="min-w-0">
                  <div className="font-medium text-[#323232] truncate">{h.name}</div>
                  <div className="text-xs text-gray-500 truncate">{h.desc}</div>
                  <a
                    className="text-xs text-blue-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                    href={explorerTxLink(network, h.digest)}
                  >
                    {h.digest}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
