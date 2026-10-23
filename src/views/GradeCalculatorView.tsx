import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { GradeButton, GradeDisplay, GradesList } from "../components";
import GradeGlowValue from "../components/grades/GradeGlowValue";
import {
  ACTION_BUTTONS,
  FONT_CALDSTONE_SEMIBOLD,
  GRADE_NUMERIC_ROWS,
} from "../constants";
import { ButtonType, Grade, GradeCalculatorState } from "../interfaces";
import { GradeCalculatorService } from "../services";

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
  const weightedAverageRounded =
    GradeCalculatorService.roundWeightedAverage(weightedAverage);
  const weightedAverageTruncated =
    GradeCalculatorService.truncateWeightedAverage(weightedAverage);

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

  const gradeColumnValue =
    state.inputMode === "grade"
      ? displayInput
      : tempGrade !== null
        ? tempGrade.toFixed(1)
        : "";
  const weightColumnValue = state.inputMode === "weight" ? displayInput : "";

  const showWeightKeypad = state.inputMode === "weight";

  /**
   * Tamaño de teclas **solo** desde ventana + insets (sin `onLayout`).
   * Reservamos siempre el peor caso del panel superior (aviso error, nota temporal, chips peso),
   * así al aparecer la primera nota no cambia `keySize` y no hay bucle con medidas de columna.
   */
  const { keySize, keyGap, actionBtnWidth, actionBtnHeight } = useMemo(() => {
    const horizontalPad = 16;
    const inner = width - horizontalPad * 2;
    const colW = Math.max(72, Math.floor(inner / 2) - 6);

    const gap = Math.max(1, Math.min(6, Math.round(colW * 0.03)));

    const rowWidthForKeys = (ks: number) => 3 * ks + 3 * gap;
    const rowHeightForKeys = (ks: number) => ks + gap;

    const usableH = height - insets.top - insets.bottom;
    const displayBlock = 74;
    const errorReserve = 72;
    const tempReserve = 44;
    const chipReserve = 52;
    const finalAverageBar = 130;
    const verticalGaps = 20;
    const notesHeaderReserve = 30;
    const topOverhead =
      displayBlock +
      errorReserve +
      tempReserve +
      chipReserve +
      finalAverageBar +
      verticalGaps +
      notesHeaderReserve;
    
    const notesListMaxHeight = Math.max(80, usableH * 0.25);
    const remainingForKeyboard = Math.max(200, usableH - topOverhead - notesListMaxHeight - 20);

    const rows = 4;
    const maxFromWidth = Math.floor((colW - 3 * gap) / 3);
    const innerVerticalPad = 8;
    const maxFromHeight = Math.floor((remainingForKeyboard - innerVerticalPad) / rows - gap);

    let keySize = Math.min(
      90,
      Math.max(0, maxFromWidth),
      Math.max(0, maxFromHeight),
    );
    keySize = Math.max(24, keySize);

    while (keySize > 24 && rowWidthForKeys(keySize) > colW) {
      keySize -= 1;
    }
    while (
      keySize > 24 &&
      rows * rowHeightForKeys(keySize) > remainingForKeyboard - innerVerticalPad
    ) {
      keySize -= 1;
    }

    const actionBtnHeight = Math.max(
      40,
      Math.min(56, Math.round(keySize * 0.7)),
    );
    const actionBtnWidth = Math.min(160, Math.max(80, (inner - gap * 2) / 2));

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
      if (prev.inputMode !== "weight") {
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
        weightEntryMode: "decimal",
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
        setIsNotesDrawerOpen(true);
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
      setIsNotesDrawerOpen(false);
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
    setIsNotesDrawerOpen(true);
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
        !GradeCalculatorService.canAddWeightDecimalSeparator(state.currentInput)
      );
    }
    return false;
  };

  const handleRoundedInfoPress = useCallback(() => {
    Alert.alert(
      "Nota aproximada",
      "Es la nota final redondeada al décimo más cercano, siguiendo la regla matemática habitual " +
        "(desde ,05 hacia arriba sube al siguiente décimo).\n\n" +
        `Tu nota final exacta es ${weightedAverage.toFixed(2)}, por lo que aproximada queda en ${weightedAverageRounded.toFixed(1)}.`,
    );
  }, [weightedAverage, weightedAverageRounded]);

  const handleTruncatedInfoPress = useCallback(() => {
    Alert.alert(
      "Nota truncada",
      "Es la nota final cortada en el primer decimal, sin redondear: todo lo que viene después se descarta.\n\n" +
        `Tu nota final exacta es ${weightedAverage.toFixed(2)}, por lo que truncada queda en ${weightedAverageTruncated.toFixed(1)}.`,
    );
  }, [weightedAverage, weightedAverageTruncated]);

  /* VISTA NOTA FINAL PONDERADA */
  const finalAverageSection = (
    <View style={styles.finalAverageBar}>
      <Text style={styles.finalAverageLabel}>Nota final (ponderada)</Text>
      <GradeGlowValue grade={weightedAverage} style={styles.finalAverageValue}>
        {weightedAverage.toFixed(2)}
      </GradeGlowValue>
      <View style={styles.finalAverageRow}>
        <View style={styles.finalAverageItem}>
          <View style={styles.finalAverageSubLabelRow}>
            <Text style={styles.finalAverageSubLabel}>Aproximada</Text>
            <TouchableOpacity
              onPress={handleRoundedInfoPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.finalAverageInfoIcon}>?</Text>
            </TouchableOpacity>
          </View>
          <GradeGlowValue
            grade={weightedAverageRounded}
            style={styles.finalAverageSubValue}
            compact
          >
            {weightedAverageRounded.toFixed(1)}
          </GradeGlowValue>
        </View>
        <View style={styles.finalAverageItem}>
          <View style={styles.finalAverageSubLabelRow}>
            <Text style={styles.finalAverageSubLabel}>Truncada</Text>
            <TouchableOpacity
              onPress={handleTruncatedInfoPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.finalAverageInfoIcon}>?</Text>
            </TouchableOpacity>
          </View>
          <GradeGlowValue
            grade={weightedAverageTruncated}
            style={styles.finalAverageSubValue}
            compact
          >
            {weightedAverageTruncated.toFixed(1)}
          </GradeGlowValue>
        </View>
      </View>
      <Text
        style={[
          styles.finalAverageWarning,
          !(state.grades.length > 0 && !weightOkForFinal) &&
            styles.finalAverageWarningHidden,
        ]}
      >
        ⚠️ Peso ≠ 100%
      </Text>
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
          <Text
            style={[
              styles.actionButtonText,
              { fontSize: actionBtnHeight * 0.42 },
            ]}
          >
            {btn.type === "add" && editingGradeId !== null ? "💾" : btn.label}
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
    ) : !useSplitLayout ? (
      <View style={styles.notesToggleButtonPlaceholder} />
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
    <View
      style={[
        styles.keyboardColumn,
        !useSplitLayout && styles.keyboardColumnStacked,
      ]}
    >
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
            showWeightKeypad ? (
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
            ) : (
              <>
                <GradeButton
                  label="0"
                  type="number"
                  size={keySize}
                  gap={keyGap}
                  onPress={() => handlePress("0", "number")}
                  disabled={isButtonDisabled("0", "number")}
                />
                <View style={{ width: keySize + keyGap, height: keySize + keyGap }} />
                <GradeButton
                  label="←"
                  type="delete"
                  size={keySize}
                  gap={keyGap}
                  onPress={() => handlePress("delete", "delete")}
                  disabled={false}
                />
              </>
            )
          ) : (
            <>
              <GradeButton
                label="0"
                type="number"
                size={keySize}
                gap={keyGap}
                square
                span={2}
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
            </>
          )}
        </View>
      </View>
    </View>
  );

  const displayInputSection = (
    <>
      <GradeDisplay
        gradeValue={gradeColumnValue}
        weightValue={weightColumnValue}
        activeColumn={state.inputMode}
        weightEntryMode={
          state.inputMode === "weight" ? state.weightEntryMode : undefined
        }
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

      {editingGradeId !== null && (
        <View style={styles.editingRow}>
          <Text style={styles.editingBadge}>Editando</Text>
          <TouchableOpacity
            onPress={handleCancelEdit}
            style={styles.cancelEditBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Cancelar edición"
          >
            <Text style={styles.cancelEditText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.weightModeRowPlaceholder} />
    </>
  );

  const mobileTopSection = (
    <View style={styles.mobileTopSection}>
      {finalAverageSection}
      {notesButtonSection}
    </View>
  );

  const mobileEntrySection = (
    <View style={styles.calculatorPanel}>{displayInputSection}</View>
  );

  const mobileKeypadSection = (
    <View style={styles.mobileKeypadContainer}>
      <View style={styles.mobileKeyRow}>
        <GradeButton
          label={editingGradeId !== null ? "💾" : "+"}
          type="add"
          fill
          gap={8}
          onPress={() => handlePress("add", "add")}
          disabled={false}
        />
        <GradeButton
          label="?"
          type="help"
          fill
          gap={8}
          onPress={() => handlePress("help", "help")}
          disabled={false}
        />
        <GradeButton
          label="←"
          type="delete"
          fill
          gap={8}
          onPress={() => handlePress("delete", "delete")}
          disabled={false}
        />
      </View>
      {GRADE_NUMERIC_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.mobileKeyRow}>
          {row.map((btn) => (
            <GradeButton
              key={btn.value}
              label={btn.label}
              type={btn.type}
              fill
              gap={8}
              onPress={() => handlePress(btn.value, btn.type)}
              disabled={isButtonDisabled(btn.value, btn.type)}
            />
          ))}
        </View>
      ))}
      <View style={styles.mobileKeyRow}>
        <GradeButton
          label="0"
          type="number"
          fill
          span={2}
          gap={8}
          onPress={() => handlePress("0", "number")}
          disabled={isButtonDisabled("0", "number")}
        />
        <GradeButton
          label=","
          type="decimal"
          fill
          gap={8}
          onPress={() => handlePress(".", "decimal")}
          disabled={isButtonDisabled(".", "decimal")}
        />
      </View>
    </View>
  );

  const mobileDrawerSection = (
    <Modal
      visible={isNotesDrawerOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsNotesDrawerOpen(false)}
    >
      <Pressable
        style={styles.drawerBackdrop}
        onPress={() => setIsNotesDrawerOpen(false)}
      >
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
  /* ESTILOS BASE DE PANTALLA */
  safe: {
    flex: 1,
    backgroundColor: "#000000",
  },
  root: {
    flex: 1,
    minHeight: 0,
  },

  /* ESTILOS VISTA NOTA FINAL */
  finalAverageBar: {
    flexShrink: 0,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 40,
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
  finalAverageRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 4,
  },
  finalAverageItem: {
    alignItems: "center",
  },
  finalAverageSubLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  finalAverageSubLabel: {
    ...fontApp,
    color: "#E3F2FD",
    fontSize: 11,
  },
  finalAverageInfoIcon: {
    ...fontApp,
    color: "#E3F2FD",
    fontSize: 11,
    width: 14,
    height: 14,
    lineHeight: 14,
    textAlign: "center",
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#E3F2FD",
    overflow: "hidden",
  },
  finalAverageSubValue: {
    ...fontApp,
    fontSize: 18,
  },
  finalAverageWarning: {
    ...fontApp,
    color: "#FFEB3B",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  finalAverageWarningHidden: {
    opacity: 0,
  },

  /* ESTILOS VISTA NOTA ACTUAL */
  calculatorPanel: {
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 4,
    backgroundColor: "#000000",
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
  editingRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 4,
    marginTop: 2,
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
  weightModeRowPlaceholder: {
    minHeight: 38,
    marginBottom: 8,
    marginTop: 4,
  },
  /* ESTILOS BOTONES DE ACCIÓN */
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
    marginTop: 2,
  },
  actionRowMobileBottom: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  mobileKeypadContainer: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  mobileKeyRow: {
    flex: 1,
    flexDirection: "row",
    minHeight: 48,
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
    color: "#ffffff",
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
  mobileBottomKeyboard: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    justifyContent: "flex-end",
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
    marginBottom: 4,
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

  /* ESTILOS CAJÓN NOTAS INGRESADAS */
  gradesColumn: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  gradesColumnStacked: {
    flex: 0,
    minHeight: 180,
  },
  notesToggleButton: {
    alignSelf: "center",
    backgroundColor: "#2a6bc7",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 0,
    marginBottom: 6,
  },
  notesToggleButtonText: {
    ...fontApp,
    color: "#FFFFFF",
    fontSize: 13,
  },
  notesToggleButtonPlaceholder: {
    alignSelf: "center",
    height: 34,
    marginBottom: 6,
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
});
