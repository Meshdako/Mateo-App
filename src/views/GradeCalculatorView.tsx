import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { GradeButton, GradeDisplay, GradesList } from "../components";
import GradeGlowValue from "../components/grades/GradeGlowValue";
import {
  GradeCalculatorState,
  Grade,
  ButtonType,
  WeightEntryMode,
} from "../interfaces";
import { GradeCalculatorService } from "../services";
import {
  GRADE_NUMERIC_ROWS,
  ACTION_BUTTONS,
  FONT_CALDSTONE_SEMIBOLD,
} from "../constants";

const fontApp = { fontFamily: FONT_CALDSTONE_SEMIBOLD };

const initialState: GradeCalculatorState = {
  currentInput: "",
  inputMode: "grade",
  weightEntryMode: "integer",
  grades: [],
};

export default function GradeCalculatorView() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const useSplitLayout = width >= 600;
  const [state, setState] = useState<GradeCalculatorState>(initialState);
  const [tempGrade, setTempGrade] = useState<number | null>(null);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  /** Aviso visible (p. ej. en web `Alert` no siempre se ve). */
  const [weightBudgetError, setWeightBudgetError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setWeightBudgetError(null);
  }, [state.currentInput, state.inputMode, state.weightEntryMode]);

  useEffect(() => {
    if (useSplitLayout) {
      setIsNotesDrawerOpen(false);
    }
  }, [useSplitLayout]);

  const weightedAverage = GradeCalculatorService.calculateWeightedAverage(
    state.grades,
  );

  const weightOkForFinal = useMemo(() => {
    if (state.grades.length === 0) return true;
    const totalWeight = state.grades.reduce((sum, g) => sum + g.weight, 0);
    return Math.abs(totalWeight - 100) < 0.051;
  }, [state.grades]);

  const displayInput =
    state.inputMode === "grade"
      ? GradeCalculatorService.getGradeDisplayFromBuffer(state.currentInput)
      : state.weightEntryMode === "decimal"
        ? GradeCalculatorService.getWeightDisplayFromBuffer(state.currentInput)
        : state.currentInput;

  const showWeightKeypad = state.inputMode === "weight";
  const showWeightModeToggle =
    state.inputMode === "weight" && tempGrade !== null;

  /**
   * Tamaño de teclas **solo** desde ventana + insets (sin `onLayout`).
   * Reservamos siempre el peor caso del panel superior (aviso error, nota temporal, chips peso),
   * así al aparecer la primera nota no cambia `keySize` y no hay bucle con medidas de columna.
   */
  const { keySize, keyGap, actionBtnWidth, actionBtnHeight } = useMemo(() => {
    const horizontalPad = 16;
    const inner = width - horizontalPad * 2;
    const colW = Math.max(72, Math.floor(inner / 2) - 6);

    const gap = Math.max(3, Math.min(10, Math.round(colW * 0.055)));

    /** Ancho total de 3 botones circulares con `marginHorizontal = gap/2` cada uno. */
    const rowWidthForKeys = (ks: number) => 3 * ks + 3 * gap;
    const rowHeightForKeys = (ks: number) => ks + gap;

    const usableH = height - insets.top - insets.bottom;
    const displayBlock = 74;
    /** Reserva fija (px) como si el aviso de error estuviera visible. */
    const errorReserve = 72;
    /** Fila «Nota:» / edición. */
    const tempReserve = 44;
    /** Fila chips enteros / decimal. */
    const chipReserve = 36;
    const actionBlock = 44;
    const finalAverageBar = 96;
    const verticalGaps = 24;
    const topOverhead =
      displayBlock +
      errorReserve +
      tempReserve +
      chipReserve +
      actionBlock +
      finalAverageBar +
      verticalGaps;
    const splitH = Math.max(48, usableH - topOverhead - 28);

    const rows = 4;
    const maxFromWidth = Math.floor((colW - 3 * gap) / 3);
    const innerVerticalPad = 8;
    const maxFromHeight = Math.floor((splitH - innerVerticalPad) / rows - gap);

    let keySize = Math.min(
      74,
      Math.max(0, maxFromWidth),
      Math.max(0, maxFromHeight),
    );
    keySize = Math.max(24, keySize);

    while (keySize > 24 && rowWidthForKeys(keySize) > colW) {
      keySize -= 1;
    }
    while (
      keySize > 24 &&
      rows * rowHeightForKeys(keySize) > splitH - innerVerticalPad
    ) {
      keySize -= 1;
    }

    const actionBtnHeight = Math.max(
      32,
      Math.min(52, Math.round(keySize * 0.64)),
    );
    const actionBtnWidth = Math.min(148, Math.max(72, (inner - gap * 2) / 2));

    return { keySize, keyGap: gap, actionBtnWidth, actionBtnHeight };
  }, [width, height, insets.top, insets.bottom]);

  const handleNumberPress = useCallback((number: string) => {
    setState((prev) => {
      const canAdd = GradeCalculatorService.canAddNumber(
        prev.currentInput,
        number,
        prev.inputMode,
        prev.weightEntryMode,
      );

      if (!canAdd) {
        return prev;
      }

      return {
        ...prev,
        currentInput: prev.currentInput + number,
      };
    });
  }, []);

  const handleWeightDecimalSeparatorPress = useCallback(() => {
    setState((prev) => {
      if (prev.inputMode !== "weight" || prev.weightEntryMode !== "decimal") {
        return prev;
      }
      if (
        !GradeCalculatorService.canAddWeightDecimalSeparator(prev.currentInput)
      ) {
        return prev;
      }
      return {
        ...prev,
        currentInput: `${prev.currentInput}.`,
      };
    });
  }, []);

  const setWeightEntryMode = useCallback((mode: WeightEntryMode) => {
    setState((prev) => {
      if (prev.inputMode !== "weight") return prev;
      if (prev.weightEntryMode === mode) return prev;
      return {
        ...prev,
        weightEntryMode: mode,
        currentInput: "",
      };
    });
  }, []);

  const handleDeletePress = useCallback(() => {
    setState((prev) => {
      if (prev.currentInput === "") {
        Alert.alert("Error", "No hay números para borrar");
        return prev;
      }

      return {
        ...prev,
        currentInput: prev.currentInput.slice(0, -1),
      };
    });
  }, []);

  const handleAddPress = useCallback(() => {
    if (state.currentInput === "") {
      Alert.alert("Error", "Debes ingresar un valor");
      return;
    }

    if (state.inputMode === "grade") {
      const formattedGrade = GradeCalculatorService.formatGrade(
        state.currentInput,
      );
      const gradeValue = parseFloat(formattedGrade);

      if (!GradeCalculatorService.isValidGrade(gradeValue)) {
        Alert.alert("Error", "La nota debe estar entre 1.0 y 7.0");
        return;
      }

      setTempGrade(gradeValue);
      setWeightBudgetError(null);
      setState((prev) => {
        if (editingGradeId !== null) {
          const row = prev.grades.find((x) => x.id === editingGradeId);
          if (row) {
            const isInt = Math.abs(row.weight - Math.round(row.weight)) < 1e-9;
            const wBuf = isInt
              ? String(Math.round(row.weight))
              : (Math.round(row.weight * 10) / 10).toFixed(1);
            return {
              ...prev,
              currentInput: wBuf,
              inputMode: "weight",
              weightEntryMode: isInt ? "integer" : "decimal",
            };
          }
        }
        return {
          ...prev,
          currentInput: "",
          inputMode: "weight",
          weightEntryMode: "integer",
        };
      });
      return;
    }

    if (state.inputMode === "weight" && tempGrade !== null) {
      const weightValue = GradeCalculatorService.parseWeightInput(
        state.currentInput,
        state.weightEntryMode,
      );

      if (
        weightValue === null ||
        !GradeCalculatorService.isValidWeight(weightValue)
      ) {
        Alert.alert(
          "Error",
          state.weightEntryMode === "decimal"
            ? "El peso debe ser mayor que 0 y como máximo 100 (ej. 25,5)."
            : "El peso debe ser un entero entre 1 y 100.",
        );
        return;
      }

      const roundedWeight =
        state.weightEntryMode === "decimal"
          ? Math.round(weightValue * 10) / 10
          : weightValue;

      if (
        GradeCalculatorService.wouldExceedTotalWeightPercent(
          state.grades,
          roundedWeight,
          editingGradeId ?? undefined,
        )
      ) {
        const currentTotal = GradeCalculatorService.getTotalWeightPercent(
          editingGradeId
            ? state.grades.filter((g) => g.id !== editingGradeId)
            : state.grades,
        );
        const dec = state.weightEntryMode === "decimal" ? 1 : 0;
        const msg =
          `Los pesos ya suman ${currentTotal.toFixed(1)} %. Con ${roundedWeight.toFixed(dec)} % pasarías del 100 % total. ` +
          "Reduce el peso de esta nota o revisa las filas anteriores.";
        setWeightBudgetError(msg);
        Alert.alert("Supera el 100 %", msg);
        return;
      }

      setWeightBudgetError(null);

      if (editingGradeId !== null) {
        setState((prev) => ({
          ...prev,
          currentInput: "",
          inputMode: "grade",
          weightEntryMode: "integer",
          grades: prev.grades.map((g) =>
            g.id === editingGradeId
              ? {
                  ...g,
                  grade: tempGrade,
                  weight: roundedWeight,
                  timestamp: Date.now(),
                }
              : g,
          ),
        }));
        setEditingGradeId(null);
        setTempGrade(null);
        return;
      }

      const newGrade: Grade = {
        id: Date.now().toString(),
        grade: tempGrade,
        weight: roundedWeight,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        currentInput: "",
        inputMode: "grade",
        weightEntryMode: "integer",
        grades: [...prev.grades, newGrade],
      }));

      setTempGrade(null);
    }
  }, [
    state.currentInput,
    state.inputMode,
    state.weightEntryMode,
    state.grades,
    tempGrade,
    editingGradeId,
  ]);

  const handleDeleteGrade = useCallback((id: string) => {
    const runDelete = () => {
      setState((prev) => ({
        ...prev,
        grades: prev.grades.filter((g) => g.id !== id),
      }));
      setEditingGradeId((cur) => (cur === id ? null : cur));
    };

    if (Platform.OS === "web") {
      const ok =
        typeof globalThis !== "undefined" &&
        typeof (globalThis as { confirm?: (message?: string) => boolean })
          .confirm === "function" &&
        (globalThis as { confirm: (message?: string) => boolean }).confirm(
          "¿Eliminar esta nota?",
        );
      if (ok) runDelete();
      return;
    }

    Alert.alert(
      "Eliminar nota",
      "¿Estás seguro de que quieres eliminar esta nota?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: runDelete,
        },
      ],
    );
  }, []);

  const handleStartEdit = useCallback(
    (id: string) => {
      if (tempGrade !== null && editingGradeId === null) {
        Alert.alert(
          "Espera",
          "Estás agregando una nueva nota. Confirma el peso con + antes de editar una fila de la lista.",
        );
        return;
      }
      const row = state.grades.find((g) => g.id === id);
      if (!row) return;
      setWeightBudgetError(null);
      setEditingGradeId(id);
      setTempGrade(null);
      setState((prev) => ({
        ...prev,
        inputMode: "grade",
        weightEntryMode: "integer",
        currentInput: GradeCalculatorService.gradeToInputBuffer(row.grade),
      }));
    },
    [state.grades, tempGrade, editingGradeId],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingGradeId(null);
    setTempGrade(null);
    setWeightBudgetError(null);
    setState((prev) => ({
      ...prev,
      currentInput: "",
      inputMode: "grade",
      weightEntryMode: "integer",
    }));
  }, []);

  const handleHelpPress = useCallback(() => {
    Alert.alert(
      "Ayuda - Sistema de Notas Chileno",
      "Nota: primer dígito 1–7; un segundo dígito opcional forma la décima (ej. 5 y 8 → 5,8). El 7 no admite más cifras.\n\n" +
        "Peso (%):\n" +
        "• Enteros: números y 0 (ej. 30, 100).\n" +
        "• Con decimal: en la última fila, 0, coma (,) y borrar; un solo decimal (ej. 25,5 %).\n" +
        "El botón + está arriba del teclado para que siempre lo veas.\n\n" +
        "+ confirma el peso y guarda la fila.\n\n" +
        "La suma de todos los pesos no puede pasar de 100 %; si ocurre, revisa esta fila o las anteriores.",
    );
  }, []);

  const handlePress = useCallback(
    (value: string, type: ButtonType) => {
      switch (type) {
        case "number":
          handleNumberPress(value);
          break;
        case "decimal":
          handleWeightDecimalSeparatorPress();
          break;
        case "delete":
          handleDeletePress();
          break;
        case "add":
          handleAddPress();
          break;
        case "help":
          handleHelpPress();
          break;
      }
    },
    [
      handleNumberPress,
      handleWeightDecimalSeparatorPress,
      handleDeletePress,
      handleAddPress,
      handleHelpPress,
    ],
  );

  const isButtonDisabled = (value: string, type: ButtonType): boolean => {
    if (type === "number") {
      return !GradeCalculatorService.canAddNumber(
        state.currentInput,
        value,
        state.inputMode,
        state.weightEntryMode,
      );
    }
    if (type === "decimal") {
      return (
        state.inputMode !== "weight" ||
        state.weightEntryMode !== "decimal" ||
        !GradeCalculatorService.canAddWeightDecimalSeparator(state.currentInput)
      );
    }
    return false;
  };

  const finalAverageSection = (
    <View style={styles.finalAverageBar}>
      <Text style={styles.finalAverageLabel}>Nota final (ponderada)</Text>
      <GradeGlowValue grade={weightedAverage} style={styles.finalAverageValue}>
        {weightedAverage.toFixed(2)}
      </GradeGlowValue>
      {state.grades.length > 0 && !weightOkForFinal && (
        <Text style={styles.finalAverageWarning}>⚠️ Peso ≠ 100%</Text>
      )}
    </View>
  );

  const splitActionButtonsSection = (
    <View style={styles.actionRow}>
      {ACTION_BUTTONS.map((btn) => (
        <TouchableOpacity
          key={btn.value}
          style={[
            styles.actionButton,
            { width: actionBtnWidth, height: actionBtnHeight },
            btn.type === "add" && styles.addButton,
            btn.type === "help" && styles.helpButton,
          ]}
          onPress={() => handlePress(btn.value, btn.type)}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionButtonText, { fontSize: actionBtnHeight * 0.42 }]}>
            {btn.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const notesButtonSection =
    !useSplitLayout && state.grades.length > 0 ? (
      <TouchableOpacity
        style={styles.notesToggleButton}
        onPress={() => setIsNotesDrawerOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.notesToggleButtonText}>Notas</Text>
      </TouchableOpacity>
    ) : null;

  const gradesSection = (
    <View style={styles.gradesColumn}>
      <GradesList
        grades={state.grades}
        onDeleteGrade={handleDeleteGrade}
        onEditGrade={handleStartEdit}
        embedded={useSplitLayout}
      />
    </View>
  );

  const keyboardSection = (
    <View style={[styles.keyboardColumn, !useSplitLayout && styles.keyboardColumnStacked]}>
      <View style={styles.keyboardContainer}>
        {GRADE_NUMERIC_ROWS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((btn) => (
              <GradeButton
                key={btn.value}
                label={btn.label}
                type={btn.type}
                size={keySize}
                gap={keyGap}
                square={!useSplitLayout}
                onPress={() => handlePress(btn.value, btn.type)}
                disabled={isButtonDisabled(btn.value, btn.type)}
              />
            ))}
          </View>
        ))}

        <View style={styles.row}>
          {useSplitLayout ? (
            showWeightKeypad && state.weightEntryMode === "decimal" ? (
              <>
                <GradeButton
                  label="0"
                  type="number"
                  size={keySize}
                  gap={keyGap}
                  onPress={() => handlePress("0", "number")}
                  disabled={isButtonDisabled("0", "number")}
                />
                <GradeButton
                  label=","
                  type="decimal"
                  size={keySize}
                  gap={keyGap}
                  onPress={() => handlePress(".", "decimal")}
                  disabled={isButtonDisabled(".", "decimal")}
                />
                <GradeButton
                  label="←"
                  type="delete"
                  size={keySize}
                  gap={keyGap}
                  onPress={() => handlePress("delete", "delete")}
                  disabled={false}
                />
              </>
            ) : showWeightKeypad ? (
              <>
                <GradeButton
                  label="0"
                  type="number"
                  size={keySize}
                  gap={keyGap}
                  onPress={() => handlePress("0", "number")}
                  disabled={isButtonDisabled("0", "number")}
                />
                <GradeButton
                  label="←"
                  type="delete"
                  size={keySize}
                  gap={keyGap}
                  onPress={() => handlePress("delete", "delete")}
                  disabled={false}
                />
              </>
            ) : (
              <GradeButton
                label="←"
                type="delete"
                size={keySize}
                gap={keyGap}
                onPress={() => handlePress("delete", "delete")}
                disabled={false}
              />
            )
          ) : showWeightKeypad && state.weightEntryMode === "decimal" ? (
            <>
              <GradeButton
                label="0"
                type="number"
                size={keySize}
                gap={keyGap}
                square
                onPress={() => handlePress("0", "number")}
                disabled={isButtonDisabled("0", "number")}
              />
              <GradeButton
                label=","
                type="decimal"
                size={keySize}
                gap={keyGap}
                square
                onPress={() => handlePress(".", "decimal")}
                disabled={isButtonDisabled(".", "decimal")}
              />
              <View style={{ width: keySize + keyGap, height: keySize + keyGap }} />
            </>
          ) : showWeightKeypad ? (
            <>
              <GradeButton
                label="0"
                type="number"
                size={keySize}
                gap={keyGap}
                square
                onPress={() => handlePress("0", "number")}
                disabled={isButtonDisabled("0", "number")}
              />
              <View style={{ width: keySize + keyGap, height: keySize + keyGap }} />
              <View style={{ width: keySize + keyGap, height: keySize + keyGap }} />
            </>
          ) : (
            <>
              <View style={{ width: keySize + keyGap, height: keySize + keyGap }} />
              <View style={{ width: keySize + keyGap, height: keySize + keyGap }} />
              <View style={{ width: keySize + keyGap, height: keySize + keyGap }} />
            </>
          )}
        </View>
      </View>
    </View>
  );

  const displayInputSection = (
    <>
      <GradeDisplay
        value={displayInput}
        mode={state.inputMode}
        placeholder={state.inputMode === "grade" ? "0.0" : "0"}
        weightEntryMode={state.inputMode === "weight" ? state.weightEntryMode : undefined}
        variant="compact"
      />

      {weightBudgetError !== null && (
        <View style={styles.weightBudgetErrorBanner} accessibilityRole="alert">
          <Text style={styles.weightBudgetErrorTitle}>Supera el 100 %</Text>
          <Text style={styles.weightBudgetErrorText} numberOfLines={4}>
            {weightBudgetError}
          </Text>
        </View>
      )}

      {tempGrade !== null && (
        <View style={styles.tempGradeContainer}>
          <View style={styles.tempGradeRow}>
            {editingGradeId !== null && <Text style={styles.editingBadge}>Editando</Text>}
            <Text style={styles.tempGradeLabel}>Nota:</Text>
            <Text style={styles.tempGradeValue}>{tempGrade.toFixed(1)}</Text>
          </View>
          {editingGradeId !== null && (
            <TouchableOpacity
              onPress={handleCancelEdit}
              style={styles.cancelEditBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Cancelar edición"
            >
              <Text style={styles.cancelEditText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showWeightModeToggle && (
        <View style={styles.weightModeRow}>
          <TouchableOpacity
            style={[
              styles.weightModeChip,
              state.weightEntryMode === "integer" && styles.weightModeChipActive,
            ]}
            onPress={() => setWeightEntryMode("integer")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.weightModeChipText,
                state.weightEntryMode === "integer" && styles.weightModeChipTextActive,
              ]}
            >
              Enteros
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.weightModeChip,
              state.weightEntryMode === "decimal" && styles.weightModeChipActive,
            ]}
            onPress={() => setWeightEntryMode("decimal")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.weightModeChipText,
                state.weightEntryMode === "decimal" && styles.weightModeChipTextActive,
              ]}
            >
              Con decimal
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  const mobileTopSection = (
    <View style={styles.mobileTopSection}>
      {finalAverageSection}
      <View style={styles.calculatorPanel}>{notesButtonSection}</View>
    </View>
  );

  const mobileEntrySection = <View style={styles.calculatorPanel}>{displayInputSection}</View>;

  const mobileDrawerSection = (
    <Modal
      visible={isNotesDrawerOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsNotesDrawerOpen(false)}
    >
      <Pressable style={styles.drawerBackdrop} onPress={() => setIsNotesDrawerOpen(false)}>
        <Pressable style={styles.drawerPanel} onPress={() => {}}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Notas ingresadas</Text>
            <TouchableOpacity
              style={styles.drawerCloseButton}
              onPress={() => setIsNotesDrawerOpen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.drawerCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <GradesList
            grades={state.grades}
            onDeleteGrade={handleDeleteGrade}
            onEditGrade={handleStartEdit}
            embedded
          />
        </Pressable>
      </Pressable>
    </Modal>
  );

  const mobileKeypadSection = (
    <View style={[styles.splitRow, styles.stackedSection]}>
      <View style={styles.actionRowMobileTop}>
        <GradeButton
          label="+"
          type="add"
          size={keySize}
          gap={keyGap}
          square
          onPress={() => handlePress("add", "add")}
          disabled={false}
        />
        <GradeButton
          label="?"
          type="help"
          size={keySize}
          gap={keyGap}
          square
          onPress={() => handlePress("help", "help")}
          disabled={false}
        />
        <GradeButton
          label="←"
          type="delete"
          size={keySize}
          gap={keyGap}
          square
          onPress={() => handlePress("delete", "delete")}
          disabled={false}
        />
      </View>
      {keyboardSection}
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.root}>
        {useSplitLayout ? (
          <>
            <View style={styles.calculatorPanel}>
              {displayInputSection}
              {splitActionButtonsSection}
            </View>
            {finalAverageSection}
            <View style={styles.splitRow}>
              {keyboardSection}
              {gradesSection}
            </View>
          </>
        ) : (
          <>
            {mobileTopSection}
            {mobileEntrySection}
            {mobileKeypadSection}
            {mobileDrawerSection}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
  },
  root: {
    flex: 1,
    minHeight: 0,
  },
  calculatorPanel: {
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 4,
  },
  weightBudgetErrorBanner: {
    marginTop: 4,
    marginBottom: 2,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#5D1A1A",
    borderWidth: 1,
    borderColor: "#E53935",
  },
  weightBudgetErrorTitle: {
    ...fontApp,
    color: "#FFCDD2",
    fontSize: 12,
    marginBottom: 2,
  },
  weightBudgetErrorText: {
    ...fontApp,
    color: "#FFEBEE",
    fontSize: 12,
    lineHeight: 16,
  },
  tempGradeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#2196F3",
    borderRadius: 6,
    marginBottom: 4,
    marginTop: 2,
  },
  tempGradeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  editingBadge: {
    ...fontApp,
    color: "#E3F2FD",
    fontSize: 11,
    backgroundColor: "#1565C0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 8,
  },
  cancelEditBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  cancelEditText: {
    ...fontApp,
    color: "#FFEB3B",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  tempGradeLabel: {
    ...fontApp,
    color: "#FFFFFF",
    fontSize: 13,
    marginRight: 6,
  },
  tempGradeValue: {
    ...fontApp,
    color: "#FFFFFF",
    fontSize: 18,
  },
  weightModeRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
    marginTop: 2,
  },
  weightModeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#444444",
  },
  weightModeChipActive: {
    backgroundColor: "#1565C0",
    borderColor: "#42A5F5",
  },
  weightModeChipText: {
    ...fontApp,
    color: "#AAAAAA",
    fontSize: 12,
  },
  weightModeChipTextActive: {
    color: "#FFFFFF",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
    marginTop: 2,
  },
  actionRowMobileTop: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  notesToggleButton: {
    alignSelf: "center",
    backgroundColor: "#2a6bc7",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 2,
  },
  notesToggleButtonText: {
    ...fontApp,
    color: "#FFFFFF",
    fontSize: 13,
  },
  actionButton: {
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    marginVertical: 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButton: {
    backgroundColor: "#4CAF50",
  },
  helpButton: {
    backgroundColor: "#2196F3",
  },
  actionButtonText: {
    ...fontApp,
    color: "#FFFFFF",
  },
  keyboardContainer: {
    alignSelf: "stretch",
    width: "100%",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
    marginBottom: 0,
  },
  splitRow: {
    flex: 1,
    flexDirection: "row",
    minHeight: 0,
    paddingHorizontal: 16,
    paddingBottom: 4,
    alignItems: "stretch",
    overflow: "hidden",
  },
  stackedSection: {
    flexDirection: "column",
    overflow: "visible",
    flexShrink: 0,
  },
  mobileTopSection: {
    flexShrink: 0,
  },
  keyboardColumn: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    justifyContent: "flex-start",
    alignItems: "stretch",
    borderRightWidth: 1,
    borderRightColor: "#2a2a2a",
    overflow: "hidden",
  },
  keyboardColumnStacked: {
    borderRightWidth: 0,
    marginBottom: 8,
  },
  gradesColumn: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  gradesColumnStacked: {
    flex: 0,
    minHeight: 180,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  drawerPanel: {
    width: "82%",
    height: "100%",
    backgroundColor: "#0b0b0b",
    borderLeftWidth: 1,
    borderLeftColor: "#2a2a2a",
    paddingTop: 12,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  drawerTitle: {
    ...fontApp,
    color: "#FFFFFF",
    fontSize: 15,
  },
  drawerCloseButton: {
    backgroundColor: "#424242",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  drawerCloseButtonText: {
    ...fontApp,
    color: "#FFFFFF",
    fontSize: 12,
  },
  finalAverageBar: {
    flexShrink: 0,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#1565C0",
    alignItems: "center",
  },
  finalAverageLabel: {
    ...fontApp,
    color: "#E3F2FD",
    fontSize: 13,
    marginBottom: 4,
  },
  finalAverageValue: {
    ...fontApp,
    color: "#FFFFFF",
    fontSize: 32,
  },
  finalAverageWarning: {
    ...fontApp,
    color: "#FFEB3B",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
});
