"""add outfit tracking and analytics tables

Revision ID: manual_outfit_migration
Revises: 
Create Date: 2026-05-29 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'manual_outfit_migration'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Add wear_count and last_worn_at to clothing_items
    op.add_column('clothing_items', sa.Column('wear_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('clothing_items', sa.Column('last_worn_at', sa.DateTime(timezone=True), nullable=True))

    # 2. Create saved_outfits table
    op.create_table(
        'saved_outfits',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('top_item_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('bottom_item_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('footwear_item_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('accessory_item_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('occasion', sa.String(length=50), nullable=True),
        sa.Column('season', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['top_item_id'], ['clothing_items.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['bottom_item_id'], ['clothing_items.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['footwear_item_id'], ['clothing_items.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['accessory_item_id'], ['clothing_items.id'], ondelete='SET NULL'),
    )
    op.create_index(op.f('ix_saved_outfits_user_id'), 'saved_outfits', ['user_id'], unique=False)

    # 3. Create outfit_history table
    op.create_table(
        'outfit_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('top_item_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('bottom_item_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('footwear_item_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('accessory_item_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('occasion', sa.String(length=50), nullable=True),
        sa.Column('weather', sa.String(length=50), nullable=True),
        sa.Column('worn_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('notes', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['top_item_id'], ['clothing_items.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['bottom_item_id'], ['clothing_items.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['footwear_item_id'], ['clothing_items.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['accessory_item_id'], ['clothing_items.id'], ondelete='SET NULL'),
    )
    op.create_index(op.f('ix_outfit_history_user_id'), 'outfit_history', ['user_id'], unique=False)

def downgrade() -> None:
    op.drop_table('outfit_history')
    op.drop_table('saved_outfits')
    op.drop_column('clothing_items', 'last_worn_at')
    op.drop_column('clothing_items', 'wear_count')
