"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";

const TimelineSection = () => {
  const timelineEvents = [
    {
      year: "1976",
      title: "NACIMIENTO",
      content:
        "Fundación de la micro empresa familiar dirigida por Hector y Mirta Nasello junto con Carlos y Holga Garavano.",
      icon: "/icons/Linea_tiempo_1976.svg", // reemplaza por la real
    },
    {
      year: "2001",
      title: "CESE",
      content: "Cese de actividades.",
      icon: "/icons/Linea_tiempo_2001.svg",
    },
    {
      year: "2006",
      title: "REINSERCIÓN",
      content: "Reinserción laboral a cargo de los hermanos Nasello.",
      icon: "/icons/Linea_tiempo_2006.svg",
    },
    {
      year: "2008",
      title: "CONSOLIDACIÓN",
      content: "Consolidación oficial de la Sociedad Anónima.",
      icon: "/icons/Linea_tiempo_2008.svg",
    },
    {
      year: "2013",
      title: "+ MAQUINARIA",
      content: "Adquisición de maquinaria y ampliación de depósito.",
      icon: "/icons/Linea_tiempo_2013.svg",
    },
    {
      year: "2018",
      title: "AMPLIACIÓN",
      content:
        "Ampliación de planta productiva y gama de conductores eléctricos.",
      icon: "/icons/Linea_tiempo_2018.svg",
    },
    {
      year: "2023",
      title: "CERTIF. ISO 9001",
      content: "Certificación oficial de ISO 9001.",
      icon: "/icons/Linea_tiempo_2023.svg",
    },
    {
      year: "2025",
      title: "CERTIF. IRAM",
      content: "Proceso de certificación oficial de normas IRAM.",
      icon: "/icons/Linea_tiempo_2025.svg",
    },
  ];

  const itemVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 3.0, ease: "easeOut", delay: 0.3 },
    },
  };

  const itemVariantsMobile = {
    hidden: { opacity: 0, y: -40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 3.0, ease: "easeOut", delay: 0.3 },
    },
  };

  return (
    <section className="py-20 bg-white relative z-0 overflow-visible">
      <div className="container mx-auto relative">
        {/* Desktop */}
        <div className="hidden md:block">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 2.0, ease: "easeOut", delay: 0.3 }}
            viewport={{ once: true }}
            className="origin-left absolute top-[48px] left-0 w-full h-[6px] z-0 bg-primary overflow-visible"
          >
            <div className="absolute right-[-70px] top-1/2 -translate-y-1/2">
              <ChevronRight className="w-20 h-20 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-wrap justify-between items-start gap-x-6 relative z-10"
          >
            {timelineEvents.map((event) => (
              <motion.div
                key={event.year}
                variants={itemVariants}
                className="group relative flex flex-col items-center text-center min-w-[100px] px-2"
              >
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  className="relative h-[96px] mb-2 flex items-center justify-center"
                >
                  <img src={event.icon} alt={event.title} className="w-24 h-24" />
                </motion.div>

                <div className="absolute w-48 -top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 sm:w-56">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-4 rounded-xl shadow-lg"
                  >
                    <p className="text-sm text-gray-600">{event.content}</p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 2.0, ease: "easeOut", delay: 0.3 }}
            viewport={{ once: true }}
            className="origin-top absolute left-[48px] top-0 h-full w-[6px] z-0 bg-primary overflow-visible hidden"
          >
            <div className="absolute bottom-[-70px] left-1/2 -translate-x-1/2">
              <ChevronDown className="w-20 h-20 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col space-y-8 relative z-10"
          >
            {timelineEvents.map((event) => (
              <motion.div
                key={event.year}
                variants={itemVariantsMobile}
                className="group relative flex items-center"
              >
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  className="relative h-[96px] w-[96px] flex items-center justify-center flex-shrink-0"
                >
                  <img src={event.icon} alt={event.title} className="w-24 h-24" />
                </motion.div>

                <div className="ml-6 flex-1">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <h3 className="font-bold text-lg mb-1">{event.year}</h3>
                    <h4 className="font-semibold text-primary mb-2">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;