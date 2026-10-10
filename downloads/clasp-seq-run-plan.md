# CLASP-seq experiment plan

Use this worksheet to plan and record a run with the versioned CLASP-seq laboratory protocol. Copy the protocol's recipes, loading calculations and acceptance criteria into the appropriate laboratory records; this planning worksheet does not supply them.

## Experiment and starting materials

| Field | Your record |
| --- | --- |
| Experiment, replicate and batch identifiers | |
| Operator, laboratory and assay date | |
| Protocol version and link | |
| Starting point: sequence lists, plasmids or qualified cell libraries | |
| TCR library identifier and construct-manifest version | |
| HLA–peptide library identifier and construct-manifest version | |
| Cell derivatives, source and passage history | |
| Expression, recovery and representation records | |
| Reagent and instrument records | |
| Deviations from the protocol | |

## Sample map

The labels below are examples of roles. Replace them with your run identifiers. Add separate entries for additional controls and replicates.

| Biological sample | Example 10x reaction label | Targeted PCR products | Actual sample/channel/index identifiers |
| --- | --- | --- | --- |
| Input receptor cells | IN_TCR | Input TCR | |
| Sorted experimental preparation | EXP_PAIRS | Experimental TCR and experimental HLA–peptide | |
| Input target cells | IN_HLA | Input HLA–peptide | |

Both experimental PCR products derive from the same capture reaction. The four targeted products are pooled for Nanopore library preparation. The input reactions have independent barcode namespaces; identical barcode strings across reactions do not identify an experimental pair. Custom sample indexes identify amplicon samples and are separate from partition barcodes.

## Controls and progression checks

Record the exact reference materials and acceptance criteria specified by the released protocol. Input-library samples characterize representation; pair-background assessment needs its own controls and analysis.

| Check | Reference/control and criteria | Observed result and supporting file | Decision/deviation |
| --- | --- | --- | --- |
| Construct identity and library representation | | | |
| Cell identity, expression and recovery | | | |
| Fluorescence controls and sorting gates | | | |
| Positive and specificity/background controls | | | |
| Post-sort composition and recovery | | | |
| Targeted amplification and process blanks | | | |
| Fragment identity, quantification and pooling | | | |
| Sequencing, assignment and replicate checks | | | |

## Assay-day handoffs

Reserve sorting, compatible 10x capture and reverse transcription together. Record actual times rather than relying only on the planned schedule.

| Stage | Responsible person / instrument | Planned time | Actual start/end | Hold, transfer or recovery record |
| --- | --- | --- | --- | --- |
| Prepare and reserve input aliquots | | | | |
| Label and pair cells | | | | |
| Stabilize the preparation | | | | |
| Sort and recover | | | | |
| 10x capture and reverse transcription | | | | |
| Target recovery and library QC | | | | |
| Nanopore preparation and sequencing | | | | |

## Counts and loading

Keep these quantities separate. Use the protocol-specific loading worksheet and record how the measured input was converted to the intended load.

| Quantity | Sample and stage | Value | Units / measurement method | Supporting record |
| --- | --- | --- | --- | --- |
| Individual cells | | | | |
| Acquired sorter events | | | | |
| Co-positive sorter events | | | | |
| Collected events | | | | |
| Recovered cells | | | | |
| Intact pairs, if assessed | | | | |
| Loaded material | | | | |
| Recovered partitions | | | | |

## Analysis and outputs

- Analysis code version, environment and configuration:
- Library/reference manifest version:
- Raw signal, reads, sample sheet and checksum record:
- Assigned, ambiguous and excluded identities, with reasons:
- Control and replicate results:
- Pair-evidence tables and figures:
- Model predictions, if made, stored separately with model settings:
- Dataset location, reuse terms and version:

Retain unobserved combinations, insufficient evidence and technical failures as distinct states. A co-positive event or shared partition alone does not establish specific recognition.

Protocol and resources: https://tcrchallenge.org/clasp-seq/
