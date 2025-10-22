"use client";

import React, { useState, useEffect } from 'react';
import { FaCircle } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';

interface CodeSimulatorProps {
  typingSpeed?: number;
}

const CodeSimulator: React.FC<CodeSimulatorProps> = ({ typingSpeed = 10 }) => {
  // --- Array con tu código final ---
  const codeLines = [
    "function makeApiRequest($url, $username, $password, $acceptHeader) {",
    "    $ch = curl_init($url);",
    "    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);",
    "    curl_setopt($ch, CURLOPT_TIMEOUT, 60);",
    "    curl_setopt($ch, CURLOPT_HTTPHEADER, [",
    "        'Authorization: Basic ' . base64_encode($username . ':' . $password),",
    "        'Accept: ' . $acceptHeader,",
    "    ]);",
    "    $response = curl_exec($ch);",
    "    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);",
    "    $error = curl_error($ch);",
    "    curl_close($ch);",
    "    if ($error) return ['error' => 'cURL Error: ' . $error];",
    "    if ($httpCode !== 200) return ['error' => 'HTTP Error: ' . $httpCode, 'response' => $response];",
    "    return ['data' => $response];",
    "}",
    "",
    "// --- LÓGICA PRINCIPAL ---",
    "",
    "// 1. Definir parámetros y acumuladores",
    "$request_starttime = date('Y-m-d', strtotime('-1 days'));",
    "$request_stoptime = date('Y-m-d');",
    "$allVehiclesData = [];",
    "$lastVin = null;",
    "$moreDataAvailable = true;",
    "$pageNumber = 1;",
    "$cargados = 0; // Inicializar contador",
    "$nocargados = 0; // Inicializar contador",
    "",
    "    $queryParams = [",
    "        'starttime' => $request_starttime,",
    "        'stoptime' => $request_stoptime,",
    "        'contentFilter' => 'VEHICLES'",
    "    ];",
    "next time we might be able to finish this shit bro!"
  ];

  const [displayedText, setDisplayedText] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Variantes para la animación de entrada con Framer Motion
  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        // --- VALORES AJUSTADOS PARA MÁS REBOTE ---
        damping: 6,
        stiffness: 100,
      },
    },
  };

  useEffect(() => {
    if (currentLineIndex >= codeLines.length) {
      setIsComplete(true);
      return;
    }
    const startTypingTimeout = setTimeout(() => {
      const currentLine = codeLines[currentLineIndex];
      let charIndex = 0;
      const typeCharacter = () => {
        if (charIndex < currentLine.length) {
          setDisplayedText((prev) => prev + currentLine.charAt(charIndex));
          charIndex++;
          setTimeout(typeCharacter, typingSpeed);
        } else {
          setDisplayedText((prev) => prev + '\n');
          setCurrentLineIndex((prev) => prev + 1);
        }
      };
      typeCharacter();
    }, 100);
    return () => clearTimeout(startTypingTimeout);
  }, [currentLineIndex, typingSpeed]);

  return (
    <motion.div
      className="w-[90vw] h-[90vh] bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-[#333333] p-3 flex items-center gap-2 border-b border-gray-700">
        <FaCircle className="text-red-500" />
        <FaCircle className="text-yellow-500" />
        <FaCircle className="text-green-500" />
      </div>

      <div className="p-5 text-sm flex-grow overflow-auto">
        <SyntaxHighlighter
          language="php"
          style={vscDarkPlus}
          wrapLines={true}
          customStyle={{
            background: 'transparent',
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'inherit',
              fontSize: 'inherit',
            },
          }}
        >
          {`${displayedText}${!isComplete ? '▋' : ''}`}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
};

export default CodeSimulator;