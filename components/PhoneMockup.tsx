"use client";

import React from "react";
import { PredictiveArcCanvas } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

const SCALE = 0.68;
const PHONE_W = 462;
const PHONE_H = 956;
const BLEED = 16; // px buffer for outline bleed (top + bottom)

export default function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    // Outer wrapper collapses to the scaled dimensions so surrounding layout is correct
    <div style={{
      width: PHONE_W * SCALE,
      height: (PHONE_H + BLEED * 2) * SCALE,
      overflow: "visible",
      flexShrink: 0,
    }}>
    <div style={{
      transform: `scale(${SCALE})`,
      transformOrigin: "top left",
      position: "relative",
      width: PHONE_W,
      height: PHONE_H + BLEED * 2,
      paddingInline: "5px",
      paddingBlock: `${BLEED}px`,
      boxSizing: "border-box",
    }}>
      {/* Outer ring — animation fills the border area */}
      <div style={{
        position: "relative",
        width: "462px",
        height: "956px",
        borderRadius: "58px",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Primary color base — fills the black areas of the animation */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundColor: "#C96442" }} />

        {/* Halftone animation — lighten blend makes black transparent, showing base color */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, mixBlendMode: "lighten" }}>
          <PredictiveArcCanvas
            variant="halftone-flow"
            hue={0.042}
            saturation={1.00}
            brightness={1.00}
          />
        </div>

        {/* Screen — plain white, inset 11px inside the ring */}
        <div style={{
          position: "absolute",
          left: "11px",
          top: "11px",
          right: "11px",
          bottom: "11px",
          borderRadius: "47px",
          backgroundColor: "white",
          overflow: "clip",
          zIndex: 1,
        }}>
          {children}
        </div>
      </div>

      {/* Status bar overlay — pointer-events none so content underneath stays interactive */}
      <div style={{
        position: "absolute",
        left: 0,
        top: BLEED,
        right: 0,
        height: "56px",
        paddingBlock: "32px",
        paddingInline: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pointerEvents: "none",
        zIndex: 10,
        boxSizing: "border-box",
      }}>
        {/* Time */}
        <div style={{
          color: "#FFFFFF",
          fontFamily: '"SF Pro", system-ui, sans-serif',
          fontSize: "18px",
          fontWeight: 600,
          letterSpacing: "-0.45px",
          lineHeight: "22px",
        }}>
          13:13
        </div>

        {/* Dynamic Island */}
        <div style={{
          backgroundColor: "#000000",
          borderRadius: "44px",
          width: "82px",
          height: "37px",
          flexShrink: 0,
        }} />

        {/* Signal + WiFi + Battery */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg viewBox="0 0 96 14.63" width="96" height="14.63">
            <path transform="matrix(1 0 0 1 0 0.377)" d="M1.856 8.528C2.194 8.528 2.498 8.607 2.779 8.775C3.060 8.944 3.285 9.169 3.454 9.450C3.623 9.731 3.701 10.036 3.701 10.373L3.701 12.027C3.701 12.365 3.623 12.668 3.454 12.949C3.285 13.230 3.060 13.455 2.779 13.624C2.498 13.793 2.194 13.872 1.856 13.872C1.519 13.872 1.204 13.793 0.923 13.624C0.642 13.455 0.416 13.230 0.247 12.949C0.079 12.668 0.000 12.365 0.000 12.027L0.000 10.373C0.000 10.036 0.078 9.731 0.247 9.450C0.416 9.169 0.642 8.944 0.923 8.775C1.204 8.607 1.519 8.528 1.856 8.528ZM7.875 6.030C8.212 6.030 8.517 6.109 8.798 6.277C9.079 6.446 9.304 6.672 9.473 6.953C9.641 7.234 9.721 7.538 9.721 7.875L9.721 12.026C9.721 12.364 9.641 12.668 9.473 12.949C9.304 13.230 9.079 13.455 8.798 13.624C8.517 13.793 8.213 13.872 7.875 13.872C7.538 13.872 7.223 13.793 6.941 13.624C6.660 13.455 6.435 13.230 6.267 12.949C6.098 12.668 6.019 12.353 6.019 12.026L6.019 7.875C6.019 7.538 6.098 7.234 6.267 6.953C6.435 6.672 6.660 6.446 6.941 6.277C7.223 6.109 7.538 6.030 7.875 6.030ZM19.902 0.000C20.240 0.000 20.544 0.078 20.825 0.247C21.106 0.416 21.331 0.642 21.500 0.923C21.669 1.204 21.747 1.507 21.747 1.845L21.747 12.026C21.747 12.364 21.669 12.668 21.500 12.949C21.331 13.230 21.106 13.455 20.825 13.624C20.544 13.793 20.240 13.872 19.902 13.872C19.565 13.872 19.250 13.793 18.969 13.624C18.687 13.455 18.462 13.230 18.293 12.949C18.124 12.668 18.046 12.364 18.046 12.026L18.046 1.845C18.046 1.508 18.124 1.204 18.293 0.923C18.462 0.642 18.687 0.416 18.969 0.247C19.250 0.078 19.565 0.000 19.902 0.000ZM13.895 3.139C14.232 3.139 14.536 3.218 14.817 3.387C15.098 3.555 15.324 3.780 15.492 4.062C15.661 4.343 15.739 4.647 15.739 4.984L15.739 12.016C15.739 12.353 15.661 12.657 15.492 12.938C15.323 13.220 15.098 13.445 14.817 13.613C14.536 13.782 14.232 13.860 13.895 13.860C13.557 13.860 13.242 13.793 12.961 13.624C12.680 13.467 12.454 13.242 12.285 12.949C12.117 12.668 12.038 12.353 12.038 12.016L12.038 4.984C12.038 4.647 12.117 4.343 12.285 4.062C12.454 3.780 12.680 3.555 12.961 3.387C13.242 3.218 13.557 3.139 13.895 3.139Z" fill="#FFFFFF" />
            <path transform="matrix(1 0 0 1 29.622 0.375)" d="M0.403 5.366C0.875 5.851 1.610 5.768 2.207 5.241C4.176 3.466 6.631 2.551 9.378 2.551C12.124 2.551 14.593 3.494 16.549 5.241C17.131 5.782 17.866 5.837 18.352 5.366C18.837 4.867 18.906 4.118 18.407 3.591C16.327 1.470 12.928 0.000 9.378 0.000C5.827 0.000 2.415 1.484 0.348 3.605C-0.151 4.118 -0.096 4.867 0.403 5.380ZM3.829 8.846C4.370 9.373 5.064 9.317 5.674 8.818C6.673 8.028 8.004 7.487 9.378 7.501C10.737 7.501 12.068 8.028 13.081 8.832C13.691 9.331 14.412 9.359 14.940 8.832C15.453 8.305 15.536 7.501 14.995 7.002C13.650 5.796 11.625 4.950 9.391 4.950C7.158 4.950 5.119 5.796 3.788 7.002C3.316 7.445 3.219 8.208 3.843 8.846ZM8.462 13.449C9.059 14.017 9.683 14.017 10.279 13.449L11.403 12.368C11.999 11.785 12.124 11.050 11.444 10.551C10.876 10.149 10.154 9.886 9.378 9.886C8.601 9.886 7.866 10.149 7.311 10.565C6.631 11.050 6.770 11.799 7.366 12.368Z" fill="#FFFFFF" />
            <path transform="matrix(1 0 0 1 56.248 0)" d="M29.254 4.860L29.254 9.371C29.704 9.247 30.751 8.243 30.751 7.116C30.751 5.988 29.704 4.984 29.254 4.860ZM28.129 8.435L28.129 9.743C28.117 10.183 28.095 10.611 28.016 11.051C27.937 11.491 27.813 11.897 27.611 12.291C27.408 12.686 27.149 13.036 26.845 13.340C26.541 13.645 26.181 13.904 25.799 14.107C25.405 14.310 24.999 14.434 24.560 14.513C24.133 14.592 23.694 14.614 23.255 14.626L4.874 14.626C4.435 14.614 4.007 14.592 3.568 14.513C3.129 14.434 2.724 14.310 2.330 14.107C1.947 13.904 1.587 13.645 1.283 13.340C0.979 13.036 0.720 12.675 0.518 12.291C0.315 11.897 0.191 11.491 0.113 11.051C0.034 10.623 0.011 10.183 0.000 9.743L0.000 4.871C0.011 4.432 0.034 4.003 0.113 3.575C0.191 3.135 0.315 2.729 0.518 2.334C0.720 1.940 0.979 1.590 1.283 1.286C1.587 0.981 1.947 0.722 2.330 0.519C2.724 0.316 3.129 0.192 3.568 0.113C3.996 0.034 4.435 0.011 4.874 0.000L23.243 0.000C23.682 0.011 24.110 0.034 24.549 0.113C24.988 0.192 25.393 0.316 25.787 0.519C26.181 0.722 26.530 0.981 26.834 1.286C27.138 1.590 27.397 1.951 27.600 2.334C27.802 2.729 27.926 3.135 28.005 3.575C28.084 4.003 28.106 4.443 28.117 4.871L28.117 8.435Z" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
    </div>
  );
}
