{
  tablePositions.map((table) => {
    const displayedX =
      (table.x / IMAGE_REAL_WIDTH) * planDimensions.displayedWidth;
    const displayedY =
      (table.y / IMAGE_REAL_HEIGHT) * planDimensions.displayedHeight;

    // Vérifie si la table est sélectionnée
    const isSelected = formData.table.includes(table.id);

    return (
      <Button
        key={table.id}
        onClick={() => handleTableSelection(table.id)}
        className='absolute w-6 h-6 rounded-full text-white'
        variant={isSelected ? 'blue' : 'default'} // Variante blue pour table sélectionnée
        style={{
          top: `${displayedY}px`,
          left: `${displayedX}px`,
          transform: 'translate(-50%, -50%)',
        }}
        type='button'
      >
        {table.id}
      </Button>
    );
  });
}
