import React from "react";

export default function CircularLogo({ isDark }) {
    const logoSrc = isDark
        ? "/assets/images/darkMode-csdl-logo.png"
        : "/assets/images/defaultMode-csdl-logo.png";

    const size = 120;     // 👈 overall size
    const radius = 60;    // 👈 circle size

    return (
        <div
            style={{
                position: "relative",
                width: size,
                height: size,
                margin: "0 auto"
            }}
        >
            {/* ROTATING TEXT */}
            <svg
                viewBox="0 0 200 200"
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    animation: "spin 12s linear infinite"
                }}
            >
                <defs>
                    <path
                        id="circlePath"
                        d={`M 100,100
                            m -${radius},0
                            a ${radius},${radius} 0 1,1 ${radius * 2},0
                            a ${radius},${radius} 0 1,1 -${radius * 2},0`}
                    />
                </defs>

                <text
                    fill={isDark ? "#7b7b7b" : "#030064"}
                    fontSize="9"          // 👈 smaller text
                    fontWeight="bold"
                    letterSpacing="1.5"  // 👈 tighter spacing
                >
                    <textPath href="#circlePath">
                        CENTER FOR STUDENT DEVELOPMENT AND LEADERSHIP &nbsp;•&nbsp; OCC &nbsp;•&nbsp;
                    </textPath>
                </text>
            </svg>

            {/* CENTER LOGO */}
            <img
                src={logoSrc}
                alt="logo"
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    height: 35, // 👈 scaled down
                    objectFit: "contain"
                }}
            />
        </div>
    );
}