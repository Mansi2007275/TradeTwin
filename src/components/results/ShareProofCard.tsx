"use client";

import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatPercent, shortenAddress } from "@/lib/utils";

export interface ShareProofCardProps {
  headline: string;
  userReturn: number;
  twinReturn: number;
  walletAddress: string;
  txHash: string;
  explorerUrl: string;
}

export const ShareProofCard = forwardRef<HTMLDivElement, ShareProofCardProps>(
  function ShareProofCard(
    { headline, userReturn, twinReturn, walletAddress, txHash, explorerUrl },
    ref,
  ) {
    const userPositive = userReturn >= 0;
    const twinPositive = twinReturn >= 0;

    return (
      <div
        ref={ref}
        style={{
          width: 480,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 32,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#1e293b",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tradetwin-logo.svg"
              alt=""
              width={30}
              height={30}
              style={{ display: "block" }}
            />
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#0f172a",
              }}
            >
              Trade<span style={{ color: "#475569" }}>Twin</span>
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#94a3b8",
              }}
            >
              On-chain simulation proof
            </p>
          </div>
        </div>

        {/* Headline */}
        <h2
          style={{
            margin: "0 0 24px",
            fontSize: 26,
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            color: "#0f172a",
          }}
        >
          {headline}
        </h2>

        {/* Returns */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          <div
            style={{
              flex: 1,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#94a3b8",
              }}
            >
              Your return
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "ui-monospace, monospace",
                color: userPositive ? "#16a34a" : "#dc2626",
                letterSpacing: "-0.02em",
              }}
            >
              {formatPercent(userReturn)}
            </p>
          </div>
          <div
            style={{
              flex: 1,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#94a3b8",
              }}
            >
              Twin return
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "ui-monospace, monospace",
                color: twinPositive ? "#16a34a" : "#dc2626",
                letterSpacing: "-0.02em",
              }}
            >
              {formatPercent(twinReturn)}
            </p>
          </div>
        </div>

        {/* Footer row: meta + QR */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            paddingTop: 20,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: "0 0 10px",
                fontSize: 11,
                fontWeight: 600,
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#16a34a",
                }}
              />
              Verified on Monad Testnet
            </p>
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 11,
                fontFamily: "ui-monospace, monospace",
                color: "#64748b",
              }}
            >
              Wallet {shortenAddress(walletAddress, 6)}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontFamily: "ui-monospace, monospace",
                color: "#64748b",
                wordBreak: "break-all",
              }}
            >
              Tx {shortenAddress(txHash, 8)}
            </p>
          </div>
          <div
            style={{
              flexShrink: 0,
              padding: 8,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}
          >
            <QRCodeSVG value={explorerUrl} size={80} level="M" includeMargin={false} />
          </div>
        </div>
      </div>
    );
  },
);
