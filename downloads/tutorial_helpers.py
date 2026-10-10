"""Local teaching helpers for TCR Challenge; no model or network calls.

10x schema: https://www.10xgenomics.com/support/software/cell-ranger/8.0/analysis/cr-5p-outputs-annotations-vdj
These pairing and PSSM conventions are tutorial choices, not Cell Ranger algorithms
or a new DecoderTCR scoring API. License: MIT (see SOURCE-LICENSE.md).
"""
from collections import Counter, defaultdict
import math

AA20 = 'ACDEFGHIKLMNPQRSTVWY'


def _true(value):
    return str(value).strip().lower() in {'true', '1'}


def prepare_10x(contigs, targets, sample_id):
    """Return query records and one audit record per barcode for ONE sample.

    Conservative first-pass policy: one distinct productive, high-confidence,
    full-length TRA and one TRB per cell. Ambiguous cells are reported, not guessed.
    Targets must explicitly supply both peptide and HLA; no HLA is inferred.
    """
    if not sample_id or not str(sample_id).strip():
        raise ValueError('Supply a sample_id to distinguish barcodes across samples.')
    if not targets:
        raise ValueError('Supply at least one peptide/HLA target.')
    for target in targets:
        peptide = str(target.get('peptide', '')).strip()
        if not peptide or set(peptide) - set(AA20) or not str(target.get('hla', '')).strip():
            raise ValueError('Each target needs a standard amino-acid peptide and an explicit HLA allele.')
    required = {'barcode', 'chain', 'v_gene', 'j_gene', 'cdr3', 'is_cell',
                'high_confidence', 'productive', 'full_length'}
    grouped = defaultdict(list)
    for row in contigs:
        missing = required - set(row)
        if missing:
            raise ValueError('Missing contig columns: ' + ', '.join(sorted(missing)))
        if not str(row['barcode']).strip():
            raise ValueError('A contig has no barcode; repair the source table before pairing.')
        grouped[str(row['barcode']).strip()].append(row)
    queries, audit = [], []
    for barcode, rows in grouped.items():
        chains = {'TRA': set(), 'TRB': set()}
        excluded = 0
        for row in rows:
            chain = str(row['chain']).strip()
            fields = tuple(str(row[k]).strip() for k in ('v_gene', 'j_gene', 'cdr3'))
            eligible = (chain in chains and all(_true(row[k]) for k in
                        ('is_cell', 'high_confidence', 'productive', 'full_length'))
                        and all(fields) and not (set(fields[2]) - set(AA20)))
            if eligible:
                chains[chain].add(fields)
            else:
                excluded += 1
        reasons = [f'{chain}: {len(values)} distinct eligible chains (need one)'
                   for chain, values in chains.items() if len(values) != 1]
        audit.append({'sample_id': sample_id, 'barcode': barcode,
                      'accepted': not reasons, 'reason': '; '.join(reasons),
                      'input_contigs': len(rows), 'excluded_contigs': excluded})
        if reasons:
            continue
        va, ja, ca = next(iter(chains['TRA']))
        vb, jb, cb = next(iter(chains['TRB']))
        for i, target in enumerate(targets):
            queries.append({'name': f'{sample_id}|{barcode}|target_{i}',
                'sample_id': sample_id, 'barcode': barcode, 'target_index': i,
                'trav': va, 'traj': ja, 'cdr3a': ca, 'trbv': vb, 'trbj': jb, 'cdr3b': cb,
                'hla': str(target['hla']).strip(), 'peptide': str(target['peptide']).strip()})
    return queries, audit


def candidate_pssm(sequences, pseudocount_mass=1.0, background=None):
    """Counts, smoothed frequencies, and log2 odds for UNIQUE equal-length designs.

    f_ia = (count_ia + pseudocount_mass * q_a) / (N + pseudocount_mass)
    PSSM_ia = log2(f_ia / q_a). Default q is uniform across AA20.
    This is a descriptive matrix for candidates, not a binding predictor.
    """
    seqs = list(dict.fromkeys(sequences))
    if not seqs or not seqs[0]:
        raise ValueError('No nonempty candidate sequences.')
    length = len(seqs[0])
    if any(len(s) != length or set(s) - set(AA20) for s in seqs):
        raise ValueError('Use equal-length sequences containing only the standard amino acids.')
    if not math.isfinite(pseudocount_mass) or pseudocount_mass <= 0:
        raise ValueError('pseudocount_mass must be finite and positive.')
    q = dict(background) if background is not None else {a: 1 / len(AA20) for a in AA20}
    if (set(q) != set(AA20) or any(not math.isfinite(v) or v <= 0 for v in q.values())
            or not math.isclose(sum(q.values()), 1.0, rel_tol=1e-9)):
        raise ValueError('Background must give positive probabilities summing to one for AA20.')
    counts, frequencies, pssm = [], [], []
    for i in range(length):
        c = Counter(s[i] for s in seqs)
        f = {a: (c[a] + pseudocount_mass * q[a]) / (len(seqs) + pseudocount_mass) for a in AA20}
        counts.append({'position': i + 1, **{a: c[a] for a in AA20}})
        frequencies.append({'position': i + 1, **f})
        pssm.append({'position': i + 1, **{a: math.log2(f[a] / q[a]) for a in AA20}})
    return counts, frequencies, pssm
